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
};
