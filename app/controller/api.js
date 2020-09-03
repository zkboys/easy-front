'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class ApiController extends Controller {
  // 查询
  async index(ctx) {
    ctx.validate({
      projectId: 'string',
    }, ctx.params);
    ctx.validate({
      categoryId: 'string?',
    }, ctx.query);

    const { projectId } = ctx.params;
    const { categoryId } = ctx.query;
    const { Api } = ctx.model;

    if (!projectId && !categoryId) return ctx.fail('projectId、categoryId不能同时为空');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (projectId) where.projectId = projectId;

    const result = await Api.findAll({ where });

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Api } = ctx.model;

    const result = await Api.findByPk(id);
    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      name: 'string',
      path: 'string',
      method: 'string',
      categoryId: 'string',
      description: 'string?',
    }, reqBody);

    const { Api, Category } = ctx.model;
    const requestBody = ctx.request.body;
    const { name, categoryId } = requestBody;

    const category = await Category.findByPk(categoryId);
    if (!category) return ctx.fail('分类不存在或已删除');

    const projectId = category.projectId;

    const foundApi = await Api.findOne({ where: { name, projectId } });
    if (foundApi) return ctx.fail('此Api名称已存在');

    const result = await Api.create({ ...reqBody, projectId });
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
      path: 'string',
      method: 'string',
      categoryId: 'string',
      description: 'string?',
    }, reqBody);

    const { id } = ctx.params;
    const { Api, Category } = ctx.model;
    const { categoryId, name } = reqBody;

    const foundApi = await Api.findByPk(id);
    if (!foundApi) return ctx.fail('此Api不存在或已删除');

    const category = await Category.findByPk(categoryId);
    if (!category) return ctx.fail('分类不存在或已删除');
    const projectId = category.projectId;

    const exitName = await Api.findOne({ where: { name, projectId } });
    if (exitName && exitName.id !== id) return ctx.fail('此Api名已被占用！');

    const result = await foundApi.update(reqBody);
    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Api } = ctx.model;

    const result = await Api.destroy({ where: { id } });
    ctx.success(result);
  }
};
