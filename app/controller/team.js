'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class TeamController extends Controller {
  // 查询
  async index(ctx) {
    const { name } = ctx.query;
    const { Team } = ctx.model;

    const options = {
      where: {
        [Op.and]: [
          name ? { name: { [Op.like]: `%${name.trim()}%` } } : undefined,
        ],
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
    const { Team, Menu } = ctx.model;

    const result = await Team.findByPk(id);

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const requestBody = ctx.request.body;
    const Team = ctx.model.Team;

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { name } = requestBody;

    const foundTeam = await Team.findOne({ where: { name } });
    if (foundTeam) return ctx.fail('此团队名已存在');

    const savedTeam = await Team.create({ ...requestBody });

    return ctx.success(savedTeam);
  }

  // 更新
  async update(ctx) {
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
    const { Team } = ctx.model;
    const result = await Team.destroy({ where: { id } });

    ctx.success(result);
  }
};
