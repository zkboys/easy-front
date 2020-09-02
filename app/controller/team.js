'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class TeamController extends Controller {
  // 查询
  async index(ctx) {
    const user = ctx.user;
    const { name } = ctx.query;
    const { Team, User } = ctx.model;

    const options = {
      where: {
        [Op.and]: [
          name ? { name: { [Op.like]: `%${name.trim()}%` } } : undefined,
        ],
      },
      include: {
        model: User,
        where: user.isAdmin ? undefined : { id: user.id },
      },
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    };

    const result = await Team.findAll(options);

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Team, User } = ctx.model;

    const result = await Team.findByPk(id, { include: User });

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const user = ctx.user;
    const requestBody = ctx.request.body;
    const Team = ctx.model.Team;

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { name } = requestBody;

    const foundTeam = await Team.findOne({ where: { name } });
    if (foundTeam) return ctx.fail('此团队名已存在');

    const savedTeam = await user.createTeam({ ...requestBody }, {
      through: { role: 'owner' },
    });

    return ctx.success(savedTeam);
  }

  // 更新
  async update(ctx) {
    const user = ctx.user;
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { id } = ctx.params;
    const { name } = requestBody;
    const { Team } = ctx.model;

    const team = await Team.findByPk(id);
    if (!team) return ctx.fail('团队不存在或已删除！');

    const exitName = await Team.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此团队名已被占用！');

    const result = await team.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Team, Project, Dynamic } = ctx.model;

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除所有关联项目
      await Project.destroy({ where: { teamId: id }, transaction });

      // 解除动态关联，但是不删除动态
      const dynamics = await Dynamic.findAll({ where: { teamId: id }, transaction });
      for (const dynamic of dynamics) {
        await dynamic.update({ teamId: null }, { transaction });
      }

      // 删除当前团队
      const result = await Team.destroy({ where: { id }, transaction });

      await transaction.commit();
      ctx.success(result);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 查询成员
  async members(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Team } = ctx.model;

    const team = await Team.findByPk(id);
    if (!team) ctx.fail('团队不存在，或已删除');

    const result = await team.getUsers();

    ctx.success(result);
  }

  // 添加成员
  async addMembers(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      userIds: 'array',
      role: [ 'master', 'member' ],
    }, ctx.request.body);

    const { id } = ctx.params;
    const { userIds, role } = ctx.request.body;

    const { Team, TeamUser } = ctx.model;

    const team = await Team.findByPk(id);
    if (!team) ctx.fail('团队不存在，或已删除');

    const users = userIds.map(userId => ({ userId, role, teamId: id }));

    const result = await TeamUser.bulkCreate(users);

    ctx.success(result);
  }

  // 修改成员
  async updateMember(ctx) {
    ctx.validate({
      id: 'string',
      memberId: 'string',
    }, ctx.params);

    ctx.validate({
      role: [ 'master', 'member' ],
    }, ctx.request.body);

    const { id, memberId } = ctx.params;
    const { role } = ctx.request.body;

    const { TeamUser } = ctx.model;

    const teamUser = await TeamUser.findOne({
      where: {
        teamId: id,
        userId: memberId,
      },
    });

    if (!teamUser) ctx.fail('记录不存在，或已删除');

    const result = await teamUser.update({ role });
    ctx.success(result);
  }

  // 删除成员
  async deleteMember(ctx) {
    ctx.validate({
      id: 'string',
      memberId: 'string',
    }, ctx.params);

    const { id, memberId } = ctx.params;
    const { TeamUser } = ctx.model;

    const result = await TeamUser.destroy({
      where: {
        teamId: id,
        userId: memberId,
      },
    });

    ctx.success(result);
  }
};
