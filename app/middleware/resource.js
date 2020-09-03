'use strict';
module.exports = {
  project: async (ctx, next) => {
    const projectId = ctx.params.projectId || ctx.query.projectId || ctx.request.body.projectId;

    const { Project } = ctx.model;
    const result = await Project.findByPk(projectId);
    if (!result) return ctx.fail('项目不存在或已删除');

    // ctx.project 为只读属性，防止业务代码串改
    Object.defineProperty(ctx, 'project', {
      writable: false,
      value: result,
    });

    await next();
  },
  category: async (ctx, next) => {
    const categoryId = ctx.params.categoryId || ctx.query.categoryId || ctx.request.body.categoryId;

    const { Category } = ctx.model;
    const result = await Category.findByPk(categoryId);
    if (!result) return ctx.fail('分类不存在或已删除');

    // ctx.project 为只读属性，防止业务代码串改
    Object.defineProperty(ctx, 'category', {
      writable: false,
      value: result,
    });

    await next();
  },
};
