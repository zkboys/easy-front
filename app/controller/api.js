'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class ApiController extends Controller {
  // 查询
  async index(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);
    ctx.validate({
      categoryId: 'int?',
    }, ctx.query);

    const { projectId } = ctx.params;
    const { categoryId } = ctx.query;
    const { Api, Category } = ctx.model;

    if (!projectId && !categoryId) return ctx.fail('projectId、categoryId不能同时为空');

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (projectId) where.projectId = projectId;

    const result = await Api.findAll({ where, include: Category });

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Api, Project, User } = ctx.model;

    const result = await Api.findByPk(id, { include: [ Project, User ] });
    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      categoryId: 'int',
    }, reqBody);

    const user = ctx.user;
    const { Api, Category } = ctx.model;
    const requestBody = ctx.request.body;
    const { categoryId, apis } = requestBody;

    const category = await Category.findByPk(categoryId);
    if (!category) return ctx.fail('分类不存在或已删除');

    const projectId = category.projectId;

    const check = async (name, method, path) => {
      const foundApi = await Api.findOne({ where: { name, projectId } });
      if (foundApi) return ctx.fail(`Api名称「${name}」已存在`);

      const foundApi2 = await Api.findOne({ where: { method, path } });
      if (foundApi2) return ctx.fail(`${method} ${path} 接口已存在！`);
    };
    // 批量添加
    if (apis && apis.length) {
      ctx.validate({
        categoryId: 'int',
        apis: 'array?',
      }, reqBody);

      for (const api of apis) {
        const { name, method, path } = api;

        await check(name, method, path);
      }

      apis.forEach(api => {
        api.projectId = projectId;
        api.categoryId = categoryId;
      });

      // 多次数据库操作，进行事务处理
      let transaction;
      try {
        transaction = await ctx.model.transaction();

        const result = [];
        for (const api of apis) {
          const { params } = api;
          const paramsToSave = [];

          if (params && params.length) {
            params.forEach(key => {
              paramsToSave.push({ key });
            });
          }

          const savedApi = await user.createApi(api, { transaction });
          result.push(savedApi);
          for (const p of paramsToSave) {
            await savedApi.createParam(p, { transaction });
          }
        }

        await transaction.commit();
        ctx.success(result);
      } catch (e) {
        if (transaction) await transaction.rollback();

        throw e;
      }
    } else {
      ctx.validate({
        name: 'string',
        path: 'string',
        method: 'string',
        categoryId: 'int',
        description: 'string?',
      }, reqBody);

      const { name, method, path } = requestBody;
      await check(name, method, path);

      const result = await user.createApi({ ...reqBody, projectId });
      ctx.success(result);
    }
  }

  // 更新
  async update(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      id: 'int',
    }, ctx.params);
    ctx.validate({
      name: 'string',
      path: 'string',
      method: 'string',
      categoryId: 'int',
      description: 'string?',
    }, reqBody);

    const { id } = ctx.params;
    const { Api, Category } = ctx.model;
    const { categoryId, name, method, path } = reqBody;

    const foundApi = await Api.findByPk(id);
    if (!foundApi) return ctx.fail('此Api不存在或已删除');

    const category = await Category.findByPk(categoryId);
    if (!category) return ctx.fail('分类不存在或已删除');
    const projectId = category.projectId;

    const exitName = await Api.findOne({ where: { name, projectId } });
    if (exitName && exitName.id !== id) return ctx.fail('此Api名已被占用！');

    const foundApi2 = await Api.findOne({ where: { method, path } });
    if (foundApi2 && foundApi2.id !== id) return ctx.fail(`${method} ${path} 接口已存在！`);

    const result = await foundApi.update(reqBody);
    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Api } = ctx.model;

    const result = await Api.destroy({ where: { id } });
    ctx.success(result);
  }

  // 根据名称查询
  async byName(ctx) {
    ctx.validate({
      name: 'string',
    }, ctx.query);

    const { name } = ctx.query;
    const { Api } = ctx.model;

    const result = await Api.findOne({ where: { name } });

    ctx.success(result);
  }
};
