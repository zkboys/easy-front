'use strict';
const Controller = require('egg').Controller;
const Mock = require('mockjs');

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

    const params = await api.getParams();

    const headerParams = params.filter(item => item.type === 'header');
    const pathParams = params.filter(item => item.type === 'path');
    const queryParams = params.filter(item => item.type === 'query');
    const bodyParams = params.filter(item => item.type === 'body');
    const responseHeaderParams = params.filter(item => item.type === 'response-header');
    const responseBodyParams = params.filter(item => item.type === 'response-body');

    if (pathParams && pathParams.length) {
      if (path.includes(':') || path.includes('{')) return ctx.fail('缺少地址参数！');
    }

    const { responseBodyType } = api;

    const checkRequired = (params, source, type) => {
      if (!params || !params.length) return;

      for (const item of params) {
        const { field, required } = item;
        if (!required) continue;

        if (
          !(field in source) ||
          source[field] === undefined ||
          source[field] === null ||
          source[field] === '') return ctx.fail(`缺少${type}参数：「${field}」`);
      }
    };
    // 检验 请求 header
    checkRequired(headerParams, ctx.headers, 'header');
    // 校验 请求 query
    checkRequired(queryParams, ctx.query, 'query');
    // 校验 请求 body
    checkRequired(bodyParams, ctx.query, 'body');

    // 设置 响应 header
    if (responseHeaderParams && responseHeaderParams.length) {
      responseHeaderParams.forEach(item => {
        const { field, defaultValue } = item;
        ctx.set(field, defaultValue);
      });
    }

    // 设置 响应 body
    if ([ 'raw' ].includes(responseBodyType)) {
      return ctx.body = responseBodyParams && responseBodyParams[0] && responseBodyParams[0].defaultValue;
    }

    if ([ 'json-object', 'json-array' ].includes(responseBodyType)) {
      return ctx.body = getMockBody(responseBodyParams, responseBodyType);
    }

    // 返回结果
    ctx.body = '未完成';
  }
};

function getMockBody(params, type) {
  if (!params || !params.length) return type === 'json-object' ? {} : [];

  const loop = (nodes, result = {}) => {
    nodes.forEach(node => {
      const { id, field, valueType, defaultValue, mock } = node;
      const children = params.filter(item => item.parentId === id);

      if (valueType === 'object') {
        result[field] = loop(children);
      } else if (valueType === 'array') {
        if (!children.length) {
          result[field] = [];
        } else {
          const p = children[0];
          const count = parseInt(mock) || 10;
          let items;
          if ([ 'object', 'array' ].includes(p.valueType)) {
            const tempKey = Symbol();
            p.field = tempKey;
            items = Array.from({ length: count }).map(() => {
              const result = loop(children);
              return result[tempKey];
            });
          } else {
            items = Array.from({ length: count }).map(() => (p.mock ? Mock.mock(p.mock) : p.defaultValue));
          }
          result[field] = items;
        }

      } else {
        result[field] = mock ? Mock.mock(mock) : defaultValue;
      }
    });

    return result;
  };

  if (type === 'json-object') return loop(params.filter(item => !item.parentId));
  if (type === 'json-array') return Array.from({ length: 10 }).map(() => loop(params.filter(item => !item.parentId))); // TODO mock 多个
}
