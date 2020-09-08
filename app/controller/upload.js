'use strict';
const Controller = require('egg').Controller;

module.exports = class CategoryController extends Controller {
  // 上传图片
  async index(ctx) {
    // 获取文件流
    const stream = await this.ctx.getFileStream();

    const url = await ctx.helper.streamToUploadFile(stream, 'file');
    ctx.success(url);
  }
};
