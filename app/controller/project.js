'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;
const path = require('path');

module.exports = class ProjectController extends Controller {
  // 查询
  async index(ctx) {
    const user = ctx.user;
    const { name, teamId } = ctx.query;
    const { Project, Team, User } = ctx.model;

    const options = {
      where: {
        [Op.and]: [
          name ? { name: { [Op.like]: `%${name.trim()}%` } } : undefined,
          teamId ? { teamId } : undefined,
        ],
      },
      include: [
        Team,
        {
          model: User,
          where: user.isAdmin ? undefined : { id: user.id },
        },
      ],
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    };

    const result = await Project.findAll(options);

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Project, Team, User, Param } = ctx.model;

    const result = await Project.findByPk(id, { include: [ Team, User, Param ] });

    ctx.success(result);
  }

  // 根据名称查询
  async byName(ctx) {
    ctx.validate({
      teamId: 'int',
    }, ctx.params);
    ctx.validate({
      name: 'string',
    }, ctx.query);

    const { teamId } = ctx.params;
    const { name } = ctx.query;
    const { Project } = ctx.model;

    const result = await Project.findOne({ where: { teamId, name } });

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const user = ctx.user;
    const requestBody = ctx.request.body;
    const Project = ctx.model.Project;

    ctx.validate({
      name: 'string',
      teamId: 'int',
      description: 'string?',
    }, requestBody);

    const { name, teamId } = requestBody;
    const { TeamUser, ProjectUser } = ctx.model;

    // 团队中不重名即可
    const foundProject = await Project.findOne({ where: { name, teamId } });
    if (foundProject) return ctx.fail('此项目名在团队中已存在');

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      const savedProject = await user.createProject({ ...requestBody }, {
        transaction,
        through: { role: 'owner' },
      });

      // 将团队中所有的成员，加入到项目中
      const teamUsers = await TeamUser.findAll({ transaction, where: { teamId } });
      const users = teamUsers
        .filter(item => item.userId !== user.id) // 排除自身
        .map(item => ({ projectId: savedProject.id, userId: item.userId, role: item.role === 'owner' ? 'master' : item.role }));

      await ProjectUser.bulkCreate(users, { transaction });

      // 创建一个默认分类
      await savedProject.createCategory({ name: '默认分类' }, { transaction });

      // 创建 wiki
      const wikiPath = path.join(ctx.app.baseDir, `app/wiki/projects/${savedProject.id}`);

      ctx.helper.mkdirsSync(wikiPath);
      ctx.helper.copyDir(path.join(ctx.app.baseDir, `app/wiki/template`), wikiPath);

      await transaction.commit();
      ctx.success(savedProject);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 更新
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'int',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      teamId: 'int',
      description: 'string?',
    }, requestBody);

    const { id: projectId } = ctx.params;
    const {
      name,
      headerParams,
      responseHeaderParams,
    } = requestBody;
    const { Project, Param } = ctx.model;

    const project = await Project.findByPk(projectId);
    if (!project) return ctx.fail('项目不存在或已删除！');

    const exitName = await Project.findOne({ where: { name } });
    if (exitName && exitName.id !== projectId) return ctx.fail('此项目名已被占用！');

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除参数
      await Param.destroy({ where: { projectId, type: 'header' }, transaction });
      await Param.destroy({ where: { projectId, type: 'response-header' }, transaction });

      const params = [];
      if (headerParams && headerParams.length) {
        headerParams.forEach(({ id, ...others }) => params.push({ ...others, type: 'header', projectId }));
      }
      if (responseHeaderParams && responseHeaderParams.length) {
        responseHeaderParams.forEach(({ id, ...others }) => params.push({ ...others, type: 'response-header', projectId }));
      }
      await Param.bulkCreate(params, { transaction });

      const result = await project.update({ ...requestBody }, { transaction });
      await transaction.commit();
      ctx.success(result);

    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Project } = ctx.model;

    const result = await Project.destroy({ where: { id } });

    // 删除wiki
    const wikiPath = path.join(__dirname, '../wiki', 'projects', `${id}`);
    const exist = ctx.helper.fileExists(wikiPath);
    if (exist) {
      await ctx.helper.unlinkDir(wikiPath);
    }

    ctx.success(result);
  }

// 查询成员
  async members(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);

    const { projectId } = ctx.params;
    const { Project } = ctx.model;

    const project = await Project.findByPk(projectId);
    if (!project) ctx.fail('项目不存在，或已删除');

    const result = await project.getUsers();

    ctx.success(result);
  }

  // 添加成员
  async addMembers(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);

    ctx.validate({
      userIds: 'array',
      role: [ 'master', 'member' ],
    }, ctx.request.body);

    const { projectId } = ctx.params;
    const { userIds, role } = ctx.request.body;

    const { Project, ProjectUser } = ctx.model;

    const project = await Project.findByPk(projectId);
    if (!project) ctx.fail('项目不存在，或已删除');

    const users = userIds.map(userId => ({ userId, role, projectId }));

    const result = await ProjectUser.bulkCreate(users);

    ctx.success(result);
  }

  // 修改成员
  async updateMember(ctx) {
    ctx.validate({
      projectId: 'int',
      id: 'string',
    }, ctx.params);

    ctx.validate({
      role: [ 'master', 'member' ],
    }, ctx.request.body);

    const { projectId, id } = ctx.params;
    const { role } = ctx.request.body;

    const { ProjectUser } = ctx.model;

    const projectUser = await ProjectUser.findOne({
      where: {
        projectId,
        userId: id,
      },
    });

    if (!projectUser) ctx.fail('记录不存在，或已删除');

    const result = await projectUser.update({ role });
    ctx.success(result);
  }

  // 删除成员
  async destroyMember(ctx) {
    ctx.validate({
      id: 'string',
      projectId: 'string',
    }, ctx.params);

    const { id, projectId } = ctx.params;
    const { ProjectUser } = ctx.model;

    const result = await ProjectUser.destroy({
      where: {
        projectId,
        userId: id,
      },
    });

    ctx.success(result);
  }

  // 离开项目
  async leave(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);

    const memberId = ctx.user.id;
    const { projectId } = ctx.params;
    const { ProjectUser } = ctx.model;

    const result = await ProjectUser.destroy({
      where: {
        projectId,
        userId: memberId,
      },
    });

    ctx.success(result);
  }
};
