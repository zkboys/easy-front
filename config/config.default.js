/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const exports = {};

  // use for cookie sign key, should change to your own and keep security
  exports.keys = appInfo.name + '_1597806902764_7388';

  // add your middleware config here
  exports.middleware = [
    'authenticate',
    'errorHandler',
  ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 静态文件
  exports.static = {
    prefix: '/public/',
    dir: [
      path.join(appInfo.baseDir, 'app/public'),
      {
        prefix: '/public/static',
        dir: path.join(appInfo.baseDir, 'app/public/static'),
        maxAge: 3153600000, // 一百年
      },
      {
        prefix: '/docs',
        dir: path.join(appInfo.baseDir, 'docs'),
      },
      {
        prefix: '/upload',
        dir: path.join(appInfo.baseDir, 'app/upload'),
      },
      {
        prefix: '/wiki',
        dir: path.join(appInfo.baseDir, 'app/wiki'),
      },
      {
        prefix: '/minder-editor',
        dir: path.join(appInfo.baseDir, 'app/minder-editor'),
      },
    ],
  };

  // 页面模板引擎
  exports.view = {
    root: path.join(appInfo.baseDir, 'app/public'),
    mapping: {
      '.ejs': 'ejs',
      '.html': 'ejs',
    },
  };

  exports.security = {
    domainWhiteList: [
      'localhost:4200',
    ],
    csrf: {
      enable: false,
    },
  };

  exports.cors = {
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    // consoleLevel: 'NONE',
    dir: path.join(appInfo.baseDir, 'logs'),
  };

  // jwt
  exports.jwt = {
    cookieName: 'SESSION_ID',
    tokenName: 'token',
    // 最小单位 秒
    expire: 60 * 60 * 24 * 7, // 七天
    // expire: 3, // 秒
    secret: 'asdfadfadsaqwetasdf',
  };

  // 不需要登录的api 地址
  exports.noAuthApis = [
    '/api/login',
    '/api/register',
  ];

  // 配置上传
  exports.multipart = {
    fileSize: '2mb',
    mode: 'stream',
    fileExtensions: [ '.jpg', '.jpeg', '.png' ], // 扩展几种上传的文件格式
  };

  exports.validate = {
    convert: true,
    // validateRoot: false,
  };

  return {
    ...exports,
    ...userConfig,
  };
};
