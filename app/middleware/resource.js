'use strict';
module.exports = {
  project: async (ctx, next) => {
    ctx.validate({
      projectId: 'string',
    }, ctx.params);

    const { projectId } = ctx.params;
    const { Project } = ctx.model;
    const project = await Project.findByPk(projectId);
    if (!project) return ctx.fail('项目不存在或已删除');

    // ctx.project 为只读属性，防止业务代码串改
    Object.defineProperty(ctx, 'project', {
      writable: false,
      value: project,
    });

    await next();
  },
};
