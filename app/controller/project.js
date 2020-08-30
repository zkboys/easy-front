'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;

module.exports = class ProjectController extends Controller {
  // 查询
  async index(ctx) {
    const { name, teamId } = ctx.query;
    const { Project, Team } = ctx.model;

    const options = {
      where: {
        [Op.and]: [
          name ? { name: { [Op.like]: `%${name.trim()}%` } } : undefined,
          teamId ? { teamId } : undefined,
        ],
      },
      include: Team,
      order: [
        [ 'updatedAt', 'DESC' ],
      ],
    };

    const result = await Project.findAll(options);

    ctx.success(result);
  }

  // 获取详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Project, Menu } = ctx.model;

    const result = await Project.findByPk(id);

    ctx.success(result);
  }

  // 创建
  async create(ctx) {
    const requestBody = ctx.request.body;
    const Project = ctx.model.Project;

    ctx.validate({
      name: 'string',
      teamId: 'string',
      description: 'string?',
    }, requestBody);

    const { name } = requestBody;

    const foundProject = await Project.findOne({ where: { name } });
    if (foundProject) return ctx.fail('此项目名已存在');

    const savedProject = await Project.create({ ...requestBody });

    return ctx.success(savedProject);
  }

  // 更新
  async update(ctx) {
    const requestBody = ctx.request.body;

    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      name: 'string',
      teamId: 'string',
      description: 'string?',
    }, requestBody);

    const { id } = ctx.params;
    const { name } = requestBody;
    const { Project } = ctx.model;

    const project = await Project.findByPk(id);
    if (!project) return ctx.fail('项目不存在或已删除！');

    const exitName = await Project.findOne({ where: { name } });
    if (exitName && exitName.id !== id) return ctx.fail('此项目名已被占用！');

    const result = await project.update({ ...requestBody });
    ctx.success(result);
  }

  // 删除
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { Project } = ctx.model;
    const result = await Project.destroy({ where: { id } });

    ctx.success(result);
  }
};
