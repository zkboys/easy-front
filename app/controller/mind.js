'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class MindController extends Controller {

  // 获取脑图目录
  async contents(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);
    const { projectId } = ctx.params;
    const { Mind } = ctx.model;

    const results = await Mind.findAll({ where: { projectId }, attributes: [ 'id', 'parentId', 'title' ] });

    ctx.success(results);
  }

  // 保存脑图目录
  async writeContents(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);

    ctx.validate({
      content: 'object',
    }, ctx.request.body);

    const { projectId } = ctx.params;
    const { content } = ctx.request.body;
    const { Mind } = ctx.model;

    const { id, parentId, title, isNew } = content;
    let result;
    if (isNew) {
      result = await Mind.create({ parentId, title, projectId });
    } else {
      result = await Mind.update({ id, parentId, title, projectId }, { where: { id } });
    }

    return ctx.success(result);
  }

  // 删除目录及对应的脑图
  async deleteContents(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);
    ctx.validate({
      keys: 'array',
    }, ctx.request.body);

    const { projectId } = ctx.params;
    const { keys } = ctx.request.body;

    const { Mind } = ctx.model;

    const result = await Mind.destroy({
      where: {
        projectId,
        id: { [Op.in]: keys },
      },
    });

    ctx.success(result);
  }

  async mind(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Mind } = ctx.model;

    const result = await Mind.findOne({ where: { id } });

    ctx.success(result);
  }

  async updateMind(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const value = JSON.stringify(ctx.request.body || null);
    const { Mind } = ctx.model;

    const found = await Mind.findOne({ where: { id } });
    if (!found) return ctx.fail('脑图不存在');

    const result = await found.update({ value });

    ctx.success(result);
  }

  // 上传图片
  async upload(ctx) {
    // 获取文件流
    const stream = await this.ctx.getFileStream();
    const folder = `upload/mind`;

    const url = await ctx.helper.streamToUploadFile(stream, folder);
    ctx.success({
        data: { url },
        errno: 0,
        msg: 'ok',
      },
    );
  }
};
