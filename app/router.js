'use strict';
const path = require('path');
const fs = require('fs');

module.exports = app => {
  const { router, controller } = app;
  const api = router.namespace('/api'); // api开头的为接口

  const {
    user,
    role,
    menu,
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
  api.resources('/users', user);
  // 同步微信用户、组织架构
  api.post('/syncWeChat', user.syncWeChat);
  // 修改密码
  api.put('/updatePassword', user.updatePassword);
  // 关联角色
  api.put('/relateUserRoles', user.relateUserRoles);
  // 获取当前登录用户菜单
  api.get('/sessionUserMenus', user.sessionUserMenus);

  // 角色 crud
  api.resources('/roles', role);
  // 关联菜单
  api.put('/relateRoleMenus', role.relateRoleMenus);

  // 菜单 crud
  api.resources('/menus', menu);

  // 未捕获请求，返回404
  api.get('/*', async ctx => {
    ctx.status = 404;
  });


  // 文档
  router.get('/docs', async ctx => {
    const docFile = path.join(__dirname, '../', 'docs', 'index.html');
    ctx.body = fs.readFileSync(docFile, 'UTF-8');
  });

  // 所有页面请求 返回首页
  // TODO 区分是页面请求，还是其他ajax 请求、静态文件请求
  router.get('/*', async ctx => await ctx.render('index.html'));
};
