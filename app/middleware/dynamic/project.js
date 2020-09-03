'use strict';
const { Op } = require('sequelize');
const { userLink, projectLink, categoryLink, apiLink, roleTag, getUpdateDetail } = require('./util');

module.exports = {
  create: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic } = ctx.model;

    await next();

    const { id: projectId, teamId, name } = ctx.body;
    const summary = `创建了项目${projectLink({ id: projectId, name })}`;

    await Dynamic.create({ type: 'create', title: '项目动态', teamId, projectId, summary, userId: user.id });
  },

  update: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Project } = ctx.model;
    const prevProject = await Project.findByPk(ctx.params.id);

    await next();
    const { id: projectId, teamId } = ctx.body;

    const summary = `更新了项目${projectLink(prevProject)}`;
    const map = { name: '接口名称', description: '接口描述' };
    const detail = getUpdateDetail(map, prevProject, ctx.body);

    if (detail) {
      await Dynamic.create({ type: 'update', title: '项目动态', teamId, projectId, summary, userId: user.id, detail });
    }
  },
  destroy: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Project } = ctx.model;
    const prevProject = await Project.findByPk(ctx.params.id);
    const { id: projectId, teamId } = prevProject || {};

    await next();

    const summary = `删除了项目${projectLink(prevProject)}`;
    await Dynamic.create({ type: 'delete', title: '项目动态', projectId, teamId, summary, userId: user.id });
  },
  addMembers: async (ctx, next) => {
    await next();

    const user = ctx.user;
    const { Dynamic, User, Project } = ctx.model;

    const { projectId } = ctx.params;
    const { userIds, role } = ctx.request.body;

    const project = await Project.findByPk(projectId);
    const { teamId } = project || {};

    const users = await User.findAll({ where: { id: { [Op.in]: userIds } } });

    const summary = `添加了成员${users.map(user => userLink(user)).join()}做为${roleTag(role)}`;
    await Dynamic.create({ type: 'create', title: '项目动态', teamId, projectId, summary, userId: user.id });
  },

  updateMember: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, User, Project } = ctx.model;

    const { projectId, id: memberId } = ctx.params;
    const { role } = ctx.request.body;
    const project = await Project.findByPk(projectId);
    const { teamId } = project;

    const member = await User.findOne({
      where: {
        id: memberId,
      },
      include: {
        model: Project,
        where: { id: projectId },
      },
    });

    if (!member) return await next();

    let prevRole;
    if (member && member.projects && member.projects.length) prevRole = member.projects[0].project_user.role;

    await next();

    const summary = `修改了成员${userLink(member)}角色，由${roleTag(prevRole)}更改为${roleTag(role)}`;
    await Dynamic.create({ type: 'update', title: '项目动态', teamId, projectId, summary, userId: user.id });
  },

  destroyMember: async (ctx, next) => {
    const { User } = ctx.model;
    await destroy(ctx, next, { name: '成员', Model: User, link: categoryLink });
  },
  createCategory: async (ctx, next) => {
    await create(ctx, next, { name: '分类', link: categoryLink });
  },
  updateCategory: async (ctx, next) => {
    const { Category } = ctx.model;
    const map = { name: '接口名称', description: '接口描述' };
    await update(ctx, next, {
      name: '分类',
      Model: Category,
      map,
      link: categoryLink,
    });
  },
  destroyCategory: async (ctx, next) => {
    const { Category } = ctx.model;
    await destroy(ctx, next, { name: '分类', Model: Category, link: categoryLink });
  },
  createApi: async (ctx, next) => {
    await create(ctx, next, { name: '接口', link: apiLink });
  },
  updateApi: async (ctx, next) => {
    const { Api } = ctx.model;
    const map = { name: '接口名称', method: '接口方法', path: '接口地址', description: '接口描述' };
    await update(ctx, next, {
      name: '接口',
      Model: Api,
      map,
      link: apiLink,
    });
  },
  destroyApi: async (ctx, next) => {
    const { Api } = ctx.model;
    await destroy(ctx, next, { name: '接口', Model: Api, link: apiLink });
  },
};

async function create(ctx, next, { name, link }) {
  await next();

  const { id: userId } = ctx.user;
  const { Dynamic, Project } = ctx.model;
  const { projectId } = ctx.params;
  const { teamId } = await Project.findByPk(projectId);

  const summary = `创建了${name}${link(ctx.body)}`;
  await Dynamic.create({ type: 'create', title: '项目动态', teamId, projectId, summary, userId });
}

async function update(ctx, next, { name, Model, map, link }) {
  const { id } = ctx.params;
  const { id: userId } = ctx.user;
  const { Dynamic, Project } = ctx.model;
  const prevObj = await Model.findByPk(id);

  await next();

  const { projectId } = ctx.body;
  const { teamId } = await Project.findByPk(projectId);

  const summary = `更新了${name}${link(ctx.body)}`;
  const detail = getUpdateDetail(map, prevObj, ctx.body);

  if (detail) {
    await Dynamic.create({ type: 'update', title: '项目动态', teamId, projectId, summary, userId, detail });
  }
}

async function destroy(ctx, next, { name, Model, link }) {
  const { id: userId } = ctx.user;
  const { Dynamic, Project } = ctx.model;
  const { projectId, id } = ctx.params;
  const prevObj = await Model.findByPk(id);

  await next();

  const { teamId } = await Project.findByPk(projectId);
  const summary = `${name === '成员' ? '移除' : '删除'}了${name}${link(prevObj)}`;
  await Dynamic.create({ type: 'delete', title: '项目动态', teamId, projectId, summary, userId });
}
