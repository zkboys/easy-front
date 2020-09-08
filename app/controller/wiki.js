'use strict';
const Controller = require('egg').Controller;
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const fileExists = util.promisify(fs.exists);

module.exports = class CategoryController extends Controller {

  // 查看文档
  async index(ctx) {
    const { projectId } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, 'index.html');
    ctx.body = await readFile(docFile, 'UTF-8');
  }

  // 获取文档目录
  async contents(ctx) {
    const { projectId } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, '_sidebar.md');

    const result = await readFile(docFile, 'UTF-8');

    ctx.success(result);
  }

  // 获取文章
  async article(ctx) {
    const { projectId, id } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, `${id}.md`);

    const result = await readFile(docFile, 'UTF-8');

    ctx.success(result);
  }

  // 保存文章
  async saveArticle(ctx) {
    const { projectId, id } = ctx.params;
    const { article } = ctx.request.body;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, `${id}.md`);

    await writeFile(docFile, article, 'UTF-8');

    ctx.success();
  }

  // 保存文档目录
  async writeContents(ctx) {
    const { projectId } = ctx.params;

    const { contents } = ctx.request.body;
    const folder = path.join(__dirname, '../wiki', 'projects', projectId);

    if (!contents || !contents.length) return ctx.fail('目录内容不能为空！');

    const arr = [];
    for (const item of contents) {
      const { id, content, title } = item;
      const fileName = `${id}.md`;
      const filePath = path.join(folder, fileName);

      // 对应文章不存在，创建
      const exist = await fileExists(filePath);
      if (!exist) {
        await writeFile(filePath, `# ${title}`, 'UTF-8');
      }

      arr.push(content);
    }

    // 更新目录
    const contentPath = path.join(__dirname, '../wiki', 'projects', projectId, '_sidebar.md');
    await writeFile(contentPath, arr.join('\n'), 'UTF-8');

    return ctx.success();
  }
};
