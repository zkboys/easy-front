'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class ImagePageController extends Controller {
  // 查询
  async index(ctx) {
    const { name, teamId } = ctx.query;
    const { ImagePage, Team, User } = ctx.model;

    const options = {
      where: {
        [Op.and]: [
          name ? { name: { [Op.like]: `%${name.trim()}%` } } : undefined,
          teamId ? { teamId } : undefined,
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

    const result = await ImagePage.findAll(options);

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { ImagePage, Team, User, HotBlock, HotBlockFile } = ctx.model;

    const result = await ImagePage.findByPk(id, { include: [ Team, HotBlock, HotBlockFile, User ] });

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
    const { ImagePage } = ctx.model;

    const result = await ImagePage.findOne({ where: { teamId, name } });

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const { user } = ctx;
    const requestBody = ctx.request.body;
    const { ImagePage } = ctx.model;

    ctx.validate({
      name: 'string',
      teamId: 'int',
      description: 'string?',
    }, requestBody);

    const { name, teamId } = requestBody;

    // 团队中不重名即可
    const foundImagePage = await ImagePage.findOne({ where: { name, teamId } });
    if (foundImagePage) return ctx.fail('此项目名在团队中已存在');

    console.log(user);
    const savedImagePage = await ImagePage.create({ ...requestBody, userId: user.id }, {
      through: { role: 'owner' },
    });
    ctx.success(savedImagePage);
  }

  // 更新
  async update(ctx) {
    const { user } = ctx;
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'int',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      teamId: 'int',
      description: 'string?',
    }, requestBody);

    const { id: imagePageId } = ctx.params;
    const {
      name,
    } = requestBody;
    const { ImagePage } = ctx.model;

    const imagePage = await ImagePage.findByPk(imagePageId);
    if (!imagePage) return ctx.fail('项目不存在或已删除！');

    const exitName = await ImagePage.findOne({ where: { name } });
    if (exitName && exitName.id !== imagePageId) return ctx.fail('此项目名已被占用！');

    const result = await imagePage.update({ ...requestBody, userId: user.id });

    ctx.success(result);
  }

  // 保存、发布
  async saveAndDeploy(ctx) {
    const { user } = ctx;
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'string',
      teamId: 'int',
    }, ctx.params);

    ctx.validate({
      quality: 'int',
      curHeight: 'int',
      hotBlockFileId: 'int',
      blocks: 'array?',
      // src: 'string', // TODO
    }, requestBody);

    const { id: imagePageId, teamId } = ctx.params;
    const { blocks } = requestBody;

    const { ImagePage, HotBlock } = ctx.model;

    const imagePage = await ImagePage.findByPk(imagePageId);
    if (!imagePage) return ctx.fail('页面不存在或已删除！');

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 更新页面信息
      const result = await imagePage.update({ ...requestBody, teamId, userId: user.id });

      // 删除 热区
      await HotBlock.destroy({ where: { imagePageId }, transaction });

      // 从新 添加 热区
      blocks.forEach(item => item.imagePageId = imagePageId);
      await HotBlock.bulkCreate(blocks, { transaction });

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
    const { ImagePage } = ctx.model;

    const result = await ImagePage.destroy({ where: { id } });

    ctx.success(result);
  }

  // 批量保存blocks
  async saveBlocks(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    ctx.validate({
      blocks: 'array',
    }, ctx.request.body);

    const { id } = ctx.params;
    const { blocks } = ctx.request.body;
    const { HotBlock } = ctx.model;

    blocks.forEach(item => {
      item.imagePageId = id;
    });

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除
      await HotBlock.destroy({ where: { imagePageId: id }, transaction });

      // 添加
      const savedBlocks = await HotBlock.bulkCreate(blocks, { transaction });

      await transaction.commit();

      ctx.success(savedBlocks);
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }
};
