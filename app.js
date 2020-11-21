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
        name: '管理员',
        description: '管理员拥有所有系统权限',
        frozen: true,
      });

      const touristRole = await Role.create({
        name: '员工',
        description: '普通员工',
        frozen: true,
      });

      const defaultPassword = bcrypt.hashSync('123456', 8);

      // 创建一个管理员用户
      const user = await adminRole.createUser({
        account: 'admin',
        jobNumber: 'admin',
        password: defaultPassword,
        name: '超级管理员',
        isAdmin: true,
        frozen: true,
        email: 'admin@qq.com',
        avatar: 'http://wework.qpic.cn/bizmail/Qia94iavsCiagdfPzKQG5OK2Ek4c92J27vhbHLDRibIuUdS1eF2AzsPuiaw/0',
      });

      // 创建一个游客
      await touristRole.createUser({
        account: 'test',
        jobNumber: 'test',
        password: defaultPassword,
        name: '员工',
        email: 'tourist@qq.com',
        avatar: 'http://wework.qpic.cn/bizmail/TaYPtwyovGuvgPwm6wfnf2rXZdVib27SuGaEh1rxyKncyEB46dKF47A/0',
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

      // 创建一个团队
      const team = await user.createTeam({
        name: '测试团队',
        description: '测试团队的描述',
      });
      await team.createImagePage({
        name: '测试页面',
        src: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        description: '我是测试页面',
      });
    });

  }
};
