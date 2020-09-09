'use strict';
const Controller = require('egg').Controller;
const path = require('path');

module.exports = class CategoryController extends Controller {

  // 查看文档
  async index(ctx) {
    const { projectId } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, 'index.html');
    ctx.body = await ctx.helper.readFile(docFile, 'UTF-8');
  }

  // 获取文档目录
  async contents(ctx) {
    const { projectId } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, '_sidebar.md');

    const result = await ctx.helper.readFile(docFile, 'UTF-8');

    ctx.success(result);
  }

  // 获取文章
  async article(ctx) {
    const { projectId, id } = ctx.params;

    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, `${id}.md`);

    let result = await ctx.helper.readFile(docFile, 'UTF-8');

    const str = '](imgs';
    const s = `](/wiki/projects/${projectId}/imgs`;
    while (result.includes(str)) {
      result = result.replace(str, s);
    }

    ctx.success(result);
  }

  // 保存文章
  async saveArticle(ctx) {
    const { projectId, id } = ctx.params;
    let { article } = ctx.request.body;

    // TODO 处理图片路径
    const str = `](/wiki/projects/${projectId}/imgs`;
    while (article.includes(str)) {
      article = article.replace(str, '](imgs');
    }
    const docFile = path.join(__dirname, '../wiki', 'projects', projectId, `${id}.md`);
    await ctx.helper.writeFile(docFile, article, 'UTF-8');

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
      const exist = await ctx.helper.fileExists(filePath);
      if (!exist) {
        await ctx.helper.writeFile(filePath, `# ${title}`, 'UTF-8');
      }

      arr.push(content);
    }

    // 更新目录
    const contentPath = path.join(__dirname, '../wiki', 'projects', projectId, '_sidebar.md');
    await ctx.helper.writeFile(contentPath, arr.join('\n'), 'UTF-8');

    return ctx.success();
  }

  // 删除目录及对应的文章
  async deleteContents(ctx) {
    ctx.validate({
      projectId: 'int',
    }, ctx.params);
    ctx.validate({
      keys: 'array',
    }, ctx.request.body);

    const { projectId } = ctx.params;
    const { keys } = ctx.request.body;

    // 更新目录
    const contentPath = path.join(__dirname, '../wiki', 'projects', `${projectId}`, '_sidebar.md');
    const oldContents = await ctx.helper.readFile(contentPath);
    const arr = oldContents.split('\n');
    const newArr = arr.filter(item => {
      const found = keys.find(key => item.includes(`${key}.md`));
      return !found;
    });

    await ctx.helper.writeFile(contentPath, newArr.join('\n'));

    for (const key of keys) {
      // 删除文章
      const filePath = path.join(__dirname, '../wiki', 'projects', `${projectId}`, `${key}.md`);
      await ctx.helper.unlinkFile(filePath);

      // 删除文章对应的图片
      const imgsPath = path.join(__dirname, '../wiki', 'projects', `${projectId}`, 'imgs', `${key}`);
      const exist = ctx.helper.fileExists(imgsPath);
      if (exist) {
        await ctx.helper.unlinkDir(imgsPath);
      }
    }
    ctx.success();
  }

  // 上传图片
  async upload(ctx) {
    const { projectId, key } = ctx.params;
    // 获取文件流
    const stream = await this.ctx.getFileStream();
    const folder = `wiki/projects/${projectId}/imgs/${key}`;

    const url = await ctx.helper.streamToUploadFile(stream, folder);
    ctx.success(url);
  }

};
