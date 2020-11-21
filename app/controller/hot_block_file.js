'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class HotBlockFileController extends Controller {
  // 查询
  async index(ctx) {
    const { teamId } = ctx.params;
    const { keyWord, pageNum = 1, pageSize = 10 } = ctx.query;
    const { HotBlockFile, Team, User } = ctx.model;

    const keyWordWhere = keyWord ? {
      [Op.or]: [
        'name',
        'url',
        'description',
      ].map(field => ({ [field]: { [Op.like]: `%${keyWord.trim()}%` } })),
    } : undefined;

    const page = 'pageNum' in ctx.query ? {
      offset: (pageNum - 1) * pageSize,
      limit: +pageSize,
    } : undefined;

    const options = {
      ...page,
      where: {
        [Op.and]: [
          keyWordWhere,
          { teamId },
        ],
      },
      include: [
        Team,
        User,
      ],
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    };

    const result = await HotBlockFile.findAndCountAll(options);

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { HotBlockFile, Team, User } = ctx.model;

    const result = await HotBlockFile.findByPk(id, { include: [ Team, User ] });

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
    const { HotBlockFile } = ctx.model;

    const result = await HotBlockFile.findOne({ where: { teamId, name } });

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const { user } = ctx;
    const requestBody = ctx.request.body;
    const { HotBlockFile } = ctx.model;

    ctx.validate({
      teamId: 'int',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { name } = requestBody;
    const { teamId } = ctx.params;

    // 团队中不重名即可
    const foundHotBlockFile = await HotBlockFile.findOne({ where: { name, teamId } });
    if (foundHotBlockFile) return ctx.fail('此名称在团队中已存在');

    const savedHotBlockFile = await HotBlockFile.create({ ...requestBody, teamId, userId: user.id }, {
      through: { role: 'owner' },
    });
    ctx.success(savedHotBlockFile);
  }

  // 更新
  async update(ctx) {
    const { user } = ctx;
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'int',
      teamId: 'int',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { id: hotBlockFileId, teamId } = ctx.params;
    const {
      name,
    } = requestBody;
    const { HotBlockFile } = ctx.model;

    const hotBlockFile = await HotBlockFile.findByPk(hotBlockFileId);
    if (!hotBlockFile) return ctx.fail('项目不存在或已删除！');

    const exitName = await HotBlockFile.findOne({ where: { name } });
    if (exitName && exitName.id !== hotBlockFileId) return ctx.fail('此名称已被占用！');

    const result = await hotBlockFile.update({ ...requestBody, teamId, userId: user.id });

    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { HotBlockFile } = ctx.model;

    const result = await HotBlockFile.destroy({ where: { id } });

    ctx.success(result);
  }
};
