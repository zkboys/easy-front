'use strict';

const bcrypt = require('bcryptjs');

module.exports = app => {
  /** 同步数据库 */
    const isSync = false;
  // const isSync = app.config.env === 'local' || app.config.env === 'unittest';
  if (isSync) {
    app.beforeStart(async () => {
      await app.model.sync({ force: true });

      const { Role } = app.model;

      const adminRole = await Role.create({
        name: '超级管理员',
        description: '管理员拥有所有系统权限',
      });

      const touristRole = await Role.create({
        name: '游客',
        description: '游客没有权限',
      });

      const defaultPassword = bcrypt.hashSync('123456', 8);

      // 创建一个管理员用户
      await adminRole.createUser({
        account: 'admin',
        jobNumber: 'admin',
        password: defaultPassword,
        name: '管理员',
        isAdmin: true,
        email: 'admin@qq.com',
      });

      // 创建一个游客
      await touristRole.createUser({
        account: 'test',
        jobNumber: 'test',
        password: defaultPassword,
        name: '游客',
      });

      // 初始化菜单 与超级管理员关联
      const menus = [
        { text: '用户管理', icon: 'user', path: '/users', order: 900 },
        { text: '角色管理', icon: 'lock', path: '/roles', order: 900 },
        { text: '菜单管理', icon: 'align-left', path: '/menu', order: 900 },
        // { text: '代码生成', icon: 'code', path: '/gen', order: 900 },
      ];
      for (const menu of menus) {
        await adminRole.createMenu(menu);
      }
    });

  }
};
