'use strict';
const Controller = require('egg').Controller;

module.exports = class DynamicController extends Controller {
  // 获取动态 team user project 公用
  async index(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);
    const { id } = ctx.params;
    const { pageNum = 1, pageSize = 10 } = ctx.query;
    const { Dynamic, User, Team, Project } = ctx.model;

    const page = 'pageNum' in ctx.query ? {
      offset: (pageNum - 1) * pageSize,
      limit: +pageSize,
    } : undefined;

    let where;
    if (ctx.path.includes('/teams/')) where = { teamId: id };
    if (ctx.path.includes('/projects/')) where = { project: id };
    if (ctx.path.includes('/users/')) where = { userId: id };

    if (!where) return ctx.success({ count: 0, rows: [] });

    const result = await Dynamic.findAndCountAll({
      ...page,
      where,
      include: [ User, Team, Project ],
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    });

    ctx.success(result);
  }
};
