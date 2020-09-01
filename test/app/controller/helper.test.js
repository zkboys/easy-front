'use strict';
const mock = require('egg-mock');
const assert = require('assert');

// watch模式下，每次app都重新启动，获取最新待测试代码
const isWatch = process.argv.includes('--watch');
const app = isWatch ? mock.app() : require('egg-mock/bootstrap').app;

describe('money()', () => {
  before(async () => {
    isWatch && await app.ready();
  });
  after(async () => {
    isWatch && await app && app.close();
  });

  it('should RMB', () => {
    const ctx = app.mockContext({
      // 模拟 ctx 的 headers
      headers: {
        'Accept-Language': 'zh-CN,zh;q=0.5',
      },
    });
    assert(ctx.helper.money(100) === '￥ 100');
  });

  it('should US Dolar', () => {
    const ctx = app.mockContext();
    assert(ctx.helper.money(100) === '$ 100');
  });
});

