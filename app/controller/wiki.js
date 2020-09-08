'use strict';
const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');

module.exports = class CategoryController extends Controller {

  // 查看文档
  async index(ctx) {
    const { projectId } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'project', projectId, 'index.html');
    ctx.body = fs.readFileSync(docFile, 'UTF-8');
  }

  // 获取文档目录
  async contents(ctx) {
    const { projectId } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'project', projectId, '_sidebar.md');
    ctx.body = fs.readFileSync(docFile, 'UTF-8');
  }

  // 保存文档目录
  async writeContents(ctx) {
    const { projectId } = ctx.params;

    const { contents } = ctx.body;

    const docFile = path.join(__dirname, '../wiki', 'project', projectId, '_sidebar.md');
    fs.writeFileSync(docFile, contents, 'UTF-8');

    ctx.success();
  }
};
