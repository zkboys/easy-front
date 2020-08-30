'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

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
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Project } = ctx.model;

    const result = await Project.findByPk(id);

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const user = ctx.user;
    const requestBody = ctx.request.body;
    const Project = ctx.model.Project;

    ctx.validate({
      name: 'string',
      teamId: 'string',
      description: 'string?',
    }, requestBody);

    const { name, teamId } = requestBody;
    const { TeamUser, ProjectUser } = ctx.model;

    // fixme 是否判断当前团队不重复即可？
    const foundProject = await Project.findOne({ where: { name } });
    if (foundProject) return ctx.fail('此项目名已存在');

    // 事务处理
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
        .map(item => ({ projectId: savedProject.id, userId: item.userId, role: item.role }));

      await ProjectUser.bulkCreate(users, { transaction });

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
      id: 'string',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      teamId: 'string',
      description: 'string?',
    }, requestBody);

    const { id } = ctx.params;
    const { name } = requestBody;
    const { Project } = ctx.model;

    const project = await Project.findByPk(id);
    if (!project) return ctx.fail('项目不存在或已删除！');

    const exitName = await Project.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此项目名已被占用！');

    const result = await project.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Project } = ctx.model;

    const result = await Project.destroy({ where: { id } });

    ctx.success(result);
  }
};
