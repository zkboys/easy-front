'use strict';
const path = require('path');
const fs = require('fs');
const permission = require('./middleware/permission');
const dynamic = require('./middleware/dynamic');
const resource = require('./middleware/resource');

module.exports = app => {
  const { router, controller } = app;
  const api = router.namespace('/api'); // api开头的为接口

  const {
    user,
    role,
    menu,
    team,
    project,
    category,
    dynamic: dynamicController,
    api: apiController,
    mock,
    upload,
    wiki,
    mind,
    imagePage,
    hotBlockFile,
  } = controller;

  // 登录
  api.post('/login', user.login);
  // 退出登录
  api.post('/logout', user.logout);
  // 注册请求
  api.post('/register', user.create);

  // crud
  // 说明文档 https://eggjs.org/zh-cn/basics/router.html#restful-%E9%A3%8E%E6%A0%BC%E7%9A%84-url-%E5%AE%9A%E4%B9%89
  // 获取所有用户
  // api.get('/users', user.index);
  // // 根据id查询用户
  // api.get('/users/:id', user.show);
  // // 添加用户
  // api.post('/users', user.create);
  // // 更新用户
  // api.put('/users', user.update);
  // // 删除用户
  // api.del('/users/:id', user.destroy);
  api.get('/users', user.index);
  api.get('/users/:id', user.show);
  api.post('/users', permission.admin, user.create);
  api.put('/users/:id', permission.admin, user.update);
  api.del('/users/:id', permission.admin, user.destroy);
  api.get('/users/:id/dynamics', dynamicController.index);

  // 同步微信用户、组织架构
  api.post('/syncWeChat', permission.admin, user.syncWeChat);
  // 修改密码
  api.put('/updatePassword', user.updatePassword);
  // 关联角色
  api.put('/relateUserRoles', permission.admin, user.relateUserRoles);
  // 获取当前登录用户菜单
  api.get('/sessionUserMenus', user.sessionUserMenus);
  api.post('/uploadUserAvatar', user.uploadUserAvatar);

  // 角色 crud
  api.resources('/roles', permission.admin, role);
  // 关联菜单
  api.put('/relateRoleMenus', permission.admin, role.relateRoleMenus);

  // 菜单 crud
  api.resources('/menus', permission.admin, menu);

  // 团队 crud
  api.get('/teams', team.index);
  api.get('/teams/:id', permission.team.member, team.show);
  api.post('/teams', dynamic.team.create, team.create);
  api.put('/teams/:id', permission.team.master, dynamic.team.update, team.update);
  api.del('/teams/:id', permission.team.master, dynamic.team.destroy, team.destroy);

  // 团队成员
  api.get('/teams/:teamId/members', permission.team.member, team.members);
  api.post('/teams/:teamId/members', permission.team.master, dynamic.team.addMembers, team.addMembers);
  api.put('/teams/:teamId/members/:id', permission.team.master, dynamic.team.updateMember, team.updateMember);
  api.del('/teams/:teamId/members/:id', permission.team.master, dynamic.team.destroyMember, team.destroyMember);
  api.del('/teams/:teamId/membersLeave', permission.team.member, dynamic.team.leave, team.leave);

  // 团队动态
  api.get('/teams/:id/dynamics', permission.team.member, dynamicController.index);

  // 图片页面 crud
  api.resources('/teams/:teamId/imagePages', permission.team.master, imagePage);
  api.post('/teams/:teamId/imagePages/:id/hotBlocks', permission.team.master, imagePage.saveBlocks);

  // 热区事件资源文件 crud
  api.resources('/teams/:teamId/hotBlockFiles', permission.team.master, hotBlockFile);

  // 项目 crud
  api.get('/projects', project.index);
  api.get('/projects/:id', permission.project.member, project.show);
  api.get('/teams/:teamId/projects/byName', permission.team.member, project.byName);
  api.post('/projects', dynamic.project.create, project.create);
  api.put('/projects/:id', permission.project.master, dynamic.project.update, project.update);
  api.del('/projects/:id', permission.project.master, dynamic.project.destroy, project.destroy);

  // 项目动态
  api.get('/projects/:id/dynamics', dynamicController.index);

  // 项目成员
  api.get('/projects/:projectId/members', permission.project.member, project.members);
  api.post('/projects/:projectId/members', permission.project.master, dynamic.project.addMembers, project.addMembers);
  api.put('/projects/:projectId/members/:id', permission.project.master, dynamic.project.updateMember, project.updateMember);
  api.del('/projects/:projectId/members/:id', permission.project.master, dynamic.project.destroyMember, project.destroyMember);
  api.del('/projects/:projectId/membersLeave', permission.project.member, dynamic.project.leave, project.leave);

  // 项目分类 用于判断 project是否存在 并且扩展出ctx.project
  api.get('/projects/:projectId/categories', permission.project.master, resource.project, category.index);
  api.get('/projects/:projectId/categories/:id', permission.project.master, resource.project, category.show);
  api.post('/projects/:projectId/categories', permission.project.master, resource.project, dynamic.project.createCategory, category.create);
  api.put('/projects/:projectId/categories/:id', permission.project.master, resource.project, dynamic.project.updateCategory, category.update);
  api.del('/projects/:projectId/categories/:id', permission.project.master, resource.project, dynamic.project.destroyCategory, category.destroy);

  // 项目接口
  api.get('/projects/:projectId/apis', permission.project.member, resource.project, apiController.index);
  api.get('/projects/:projectId/apis/:id', permission.project.member, resource.project, apiController.show);
  api.post('/projects/:projectId/apis', permission.project.master, resource.project, dynamic.project.createApi, apiController.create);
  api.put('/projects/:projectId/apis/:id', permission.project.master, resource.project, dynamic.project.updateApi, apiController.update);
  api.del('/projects/:projectId/apis/:id', permission.project.master, resource.project, dynamic.project.destroyApi, apiController.destroy);
  api.get('/projects/:projectId/apiByName', permission.project.member, apiController.byName);
  api.get('/projects/:projectId/byMethodPath', permission.project.member, apiController.byMethodPath);

  api.post('/upload', upload.index);

  // 获取wiki目录
  api.get('/projects/:projectId/wikiContents', wiki.contents);
  // 创建wiki目录
  api.post('/projects/:projectId/wikiContents', wiki.writeContents);
  // 删除wiki目录
  api.post('/projects/:projectId/wikiContents/delete', wiki.deleteContents);
  // 获取文章
  api.get('/projects/:projectId/wiki/:id', wiki.article);
  // 保存文章
  api.post('/projects/:projectId/wiki/:id', wiki.saveArticle);
  // 文件上传
  api.post('/projects/:projectId/upload/:key', wiki.upload);


  // 获取脑图
  api.get('/mind/:id', mind.mind);
  // 跟新脑图
  api.put('/mind/:id', mind.updateMind);
  // 上传图片
  api.post('/mind/upload', mind.upload);

  // 获取脑图目录
  api.get('/projects/:projectId/mindContents', mind.contents);
  // 创建脑图目录
  api.post('/projects/:projectId/mindContents', mind.writeContents);
  // 删除脑图目录
  api.post('/projects/:projectId/mindContents/delete', mind.deleteContents);

  // 未捕获请求，返回404
  api.get('/*', async ctx => {
    ctx.status = 404;
  });

  // mock
  [ 'get', 'put', 'post', 'del', 'options', 'head', 'patch' ].forEach(method => router[method]('/mock/:projectId/*', mock.index));

  // wiki 文档
  router.get('/wiki/projects/:projectId', wiki.index);

  // 文档
  router.get('/docs', async ctx => {
    const docFile = path.join(__dirname, '../', 'docs', 'index.html');
    ctx.body = fs.readFileSync(docFile, 'UTF-8');
  });

  // 所有页面请求 返回首页
  // TODO 区分是页面请求，还是其他ajax 请求、静态文件请求
  router.get('/*', async ctx => await ctx.render('index.html'));
};
