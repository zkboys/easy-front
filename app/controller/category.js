'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class CategoryController extends Controller {
  // 查询
  async index(ctx) {
    ctx.validate({
      projectId: 'string',
    }, ctx.params);

    const { projectId } = ctx.params;
    const { Category, Api } = ctx.model;

    const result = await Category.findAll({
      where: { projectId },
      include: Api,
    });

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Category, Api } = ctx.model;

    const result = await Category.findOne({
      where: { id },
      include: Api,
    });
    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      projectId: 'string',
    }, ctx.params);
    ctx.validate({
      name: 'string',
      description: 'string?',
    }, reqBody);

    const { projectId } = ctx.params;
    const { Category } = ctx.model;
    const requestBody = ctx.request.body;
    const { name } = requestBody;

    const foundCategory = await Category.findOne({ where: { name, projectId } });
    if (foundCategory) return ctx.fail('此分类已存在');

    const result = await Category.create({ ...reqBody, projectId });
    ctx.success(result);
  }

  // 更新
  async update(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      id: 'string',
    }, ctx.params);
    ctx.validate({
      name: 'string',
      description: 'string?',
    }, reqBody);

    const { id } = ctx.params;
    const { Category } = ctx.model;

    const category = await Category.findOne({ where: { id } });
    if (!category) return ctx.fail('此分类不存在或已删除');

    const exitName = await Category.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此分类已被占用！');


    const result = await category.update(reqBody);
    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Category } = ctx.model;

    const result = await Category.destroy({ where: { id } });
    ctx.success(result);
  }
};
