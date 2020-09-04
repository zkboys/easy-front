'use strict';
/**
 * 本地开发环境配置
 *
 * 最终生效的配置为 local + default（前者覆盖后者）
 */

module.exports = () => {
  const exports = {};

  // 数据库配置
  exports.sequelize = {
    dialect: 'mysql',
    host: '172.16.60.247',
    port: 3306,
    username: 'fd',
    password: '123456',
    database: 'easy_front',
    timezone: '+08:00',
    define: {
      charset: 'utf8',
      paranoid: true,
      dialectOptions: {
        collate: 'utf8_general_ci'
      }
    },
  };

  return exports;
};
