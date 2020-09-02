'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class CategoryController extends Controller {
  // 查询
  async index(ctx) {
    const { name } = ctx.query;

    const { Category } = ctx.model;

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

    const result = await Category.findAll(options);

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;

    const { Category, Api } = ctx.model;

    const result = await Category.findByPk(id, {
      include: Api,
    });

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const requestBody = ctx.request.body;
    const Category = ctx.model.Category;

    ctx.validate({
      name: 'string',
      description: 'string?',
    }, requestBody);

    const { name } = requestBody;

    const foundCategory = await Category.findOne({ where: { name } });
    if (foundCategory) return ctx.fail('此分类已存在');

    const savedCategory = await Category.create({ ...requestBody });

    return ctx.success(savedCategory);
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
    const { Category } = ctx.model;

    const category = await Category.findByPk(id);
    if (!category) return ctx.fail('分类不存在或已删除！');

    const exitName = await Category.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此分类已被占用！');

    const result = await category.update({ ...requestBody });
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
