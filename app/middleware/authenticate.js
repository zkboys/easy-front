'use strict';
const { pathToRegexp } = require('path-to-regexp');

/** 鉴权拦截 */
function canPass(ctx) {
  const { noAuthApis } = ctx.app.config;

  if (/^\/api/.test(ctx.path)) {
    return pathToRegexp(noAuthApis).test(ctx.path);
  }

  return true;
}

/**
 * 三种方式获取token
 * headers: <tokenName>: <token>
 * headers: Authorization: Bearer <token>
 * cookie:  <cookieName>=<token>
 * 优先级： tokenName > Authorization > cookieName
 *
 * @param ctx
 * @returns {Promise<*|string>}
 */
async function getToken(ctx) {
  const { tokenName, cookieName } = ctx.app.config.jwt;
  // const { redis } = ctx.app;

  let token;
  const headerToken = ctx.request.header[String(tokenName).toLowerCase()];
  const authorizationToken = (ctx.request.header.authorization || '').replace('Bearer', '').trim();
  const cookieToken = ctx.cookies.get(cookieName);

  if (cookieToken) token = cookieToken;
  if (authorizationToken) token = authorizationToken;
  if (headerToken) token = headerToken;

  return token;

  // const existToken = await redis.get(token);
  // return existToken || 'no token';
}

/** 验证用户是否已经登录，做统一拦截 */
module.exports = () => {
  return async function auth(ctx, next) {
    const { User } = ctx.model;

    if (canPass(ctx)) return await next();

    const token = await getToken(ctx);

    // 通过主应用进行验证
    try {
      const { mainApp } = ctx.app;
      const res = await mainApp.request({ url: '/loginUser', token });

      const { id, menus = [] } = res.data;

      let user = await User.findByPk(id);

      // 用户不存在，创建一个用户
      if (!user) {
        user = await User.create(res.data);
      }

      // ctx.user 为只读属性，防止业务代码串改
      Object.defineProperty(ctx, 'user', {
        writable: false,
        value: user,
      });

      Object.defineProperty(ctx, 'userToken', {
        writable: false,
        value: token,
      });

      Object.defineProperty(ctx, 'userMenus', {
        writable: false,
        value: menus,
      });

      await next();
    } catch (e) {
      ctx.status = 401;
    }
  };
};

