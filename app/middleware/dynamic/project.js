'use strict';
const { Op } = require('sequelize');
const { userLink, projectLink, categoryLink, roleTag } = require('./util');

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
    const { id: projectId, teamId, name, description } = ctx.body;

    const summary = `更新了项目${projectLink(prevProject)}`;
    const detail = [];
    if (prevProject.name !== name) detail.push(`项目名称<<->>${prevProject.name} -->> ${name}`);
    if (prevProject.description !== description) detail.push(`项目描述<<->>${prevProject.description} -->> ${description}`);

    if (detail.length) {
      await Dynamic.create({ type: 'update', title: '项目动态', teamId, projectId, summary, userId: user.id, detail: detail.join('\n') });
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
  createMembers: async (ctx, next) => {
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
    await next();

    const user = ctx.user;
    const { Dynamic, User, Project } = ctx.model;

    const { projectId, id: memberId } = ctx.params;

    const { teamId } = await Project.findByPk(projectId);

    const member = await User.findByPk(memberId);

    const summary = `移除了项目成员${userLink(member)}`;
    await Dynamic.create({ type: 'delete', title: '项目动态', teamId, projectId, summary, userId: user.id });
  },
  createCategory: async (ctx, next) => {
    await next();

    const user = ctx.user;
    const { Dynamic, Project } = ctx.model;

    const { projectId } = ctx.params;

    const { teamId } = await Project.findByPk(projectId);

    const summary = `添加了分类${categoryLink(ctx.request.body)}`;
    await Dynamic.create({ type: 'create', title: '项目动态', teamId, projectId, summary, userId: user.id });
  },
  updateCategory: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Project, Category } = ctx.model;
    const prevCategory = await Category.findByPk(ctx.params.id);

    await next();
    const { projectId, name, description } = ctx.body;
    const { teamId } = await Project.findByPk(projectId);

    const summary = `更新了分类${categoryLink(ctx.body)}`;
    const detail = [];
    if (prevCategory.name !== name) detail.push(`分类名称<<->>${prevCategory.name} -->> ${name}`);
    if (prevCategory.description !== description) detail.push(`分类描述<<->>${prevCategory.description} -->> ${description}`);

    if (detail.length) {
      await Dynamic.create({ type: 'update', title: '项目动态', teamId, projectId, summary, userId: user.id, detail: detail.join('\n') });
    }
  },
  destroyCategory: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Project, Category } = ctx.model;
    const { projectId, id: categoryId } = ctx.params;
    const prevCategory = await Category.findByPk(categoryId);

    await next();

    const { teamId } = await Project.findByPk(projectId);
    const summary = `删除了项目分类${categoryLink(prevCategory)}`;
    await Dynamic.create({ type: 'delete', title: '项目动态', teamId, projectId, summary, userId: user.id });
  },
  createApi: async (ctx, next) => {

  },
  updateApi: async (ctx, next) => {

  },
  destroyApi: async (ctx, next) => {

  },
};
