'use strict';

const bcrypt = require('bcryptjs');
const { Service } = require('egg');
const _ = require('lodash');

/**
 * Test Service
 */
module.exports = class UserService extends Service {
  /**
   * 对比密码
   * @param password
   * @param hashPassword
   * @returns {*}
   */
  comparePassword(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword);
  }

  /**
   * 密码加密
   * @param password
   * @returns {*}
   */
  encryptPassword(password) {
    return bcrypt.hashSync(password, 8);
  }

  safeUser(user) {
    return _.omit(user.toJSON(), [ 'password' ]);
  }

  // 从主系统中查询所有用户
  async getUsers() {
    // 每次获取都同步一次
    const { users } = await this.syncUsersAndDepartments();

    return users;
    //
    // const { app, ctx } = this;
    // const { mainApp } = app;
    // const { userToken } = ctx;
    // const res = await mainApp.request({ url: '/users', userToken });
    //
    // const { rows = [] } = res.data;
    //
    // return rows;
  }

  // 从主系统中同步用户
  async syncUsersAndDepartments() {
    const { ctx } = this;
    const { Department, User, DepartmentUser } = ctx.model;
    const { userToken, app } = ctx;
    const { mainApp } = app;

    const res = await mainApp.request({ url: '/usersAndDepartments', token: userToken });
    const { users, departments, departmentUsers } = res.data;

    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 批量插入 或 更新
      await User.bulkCreate(users, { ignoreDuplicates: true, transaction });
      await Department.bulkCreate(departments, { ignoreDuplicates: true, transaction });
      await DepartmentUser.bulkCreate(departmentUsers, { ignoreDuplicates: true, transaction });

      await transaction.commit();

      return { users, departments, departmentUsers };

    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }
};
