'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class MenuController extends Controller {
  // 查询菜单
  async index(ctx) {
    const { Menu } = ctx.model;
    const options = {
      order: [
        [ 'updatedAt', 'ASC' ],
      ],
    };

    const result = await Menu.findAll(options);

    ctx.success(result);
  }

  // 获取菜单详情
  async show(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Menu } = ctx.model;

    const result = await Menu.findByPk(id);
    ctx.success(result);
  }

  // 创建菜单
  async create(ctx) {
    const requestBody = ctx.request.body;
    const Menu = ctx.model.Menu;

    ctx.validate({
      text: 'string',
    }, requestBody);

    const savedMenu = await Menu.create({ ...requestBody });

    return ctx.success(savedMenu);
  }

  // 更新菜单
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Menu } = ctx.model;

    const menu = await Menu.findByPk(id);
    if (!menu) return ctx.fail('菜单不存在或已删除！');

    const result = await menu.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除菜单 及子菜单
  async destroy(ctx) {
    ctx.validate({
      id: 'int',
    }, ctx.params);

    const { id } = ctx.params;
    const { Menu } = ctx.model;
    const result = await Menu.destroy({
      where: {
        [Op.or]:
          [
            { id },
            { parentId: id },
          ],
      },
    });

    ctx.success(result);
  }
};
