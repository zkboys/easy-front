'use strict';
const Controller = require('egg').Controller;

const { pathToRegexp } = require('path-to-regexp');

module.exports = class MockController extends Controller {
  // 查询
  async index(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);

    const { Api, Param } = ctx.model;
    const { projectId } = ctx.params;
    const { method } = ctx;
    const [ , , , ...paths ] = ctx.path.split('/');
    const path = '/' + paths.join('/');

    const api = await ctx.helper.findApiByMethodAndPath(method, path);

    if (!api) return ctx.fail(404, '接口不存在');

    // 检验 请求 header

    // 校验 请求 query

    // 校验 请求 body

    // 设置 响应 header

    // 设置 响应 body

    // 返回结果

    console.log(projectId);
    console.log(ctx.path);
    console.log(ctx.method);

    ctx.success(projectId);
  }
};
