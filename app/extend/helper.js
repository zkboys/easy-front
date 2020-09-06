'use strict';
const { pathToRegexp } = require('path-to-regexp');

module.exports = {
  async findApiByMethodAndPath(method, path) {
    const { Api } = this.app.model;

    // 根据 projectId method path 查找对应的api
    const methodApis = await Api.findAll({
      where: {
        method: method.toLowerCase(),
      },
    });

    return methodApis.find(item => {
      let apiPath = item.path;

      if (apiPath.includes('{')) {
        apiPath = apiPath.replace('{', ':').replace('}', '');
      }

      if (apiPath.includes(':')) {
        const re = pathToRegexp(apiPath);
        return !!re.exec(path);
      } else {
        return apiPath === path;
      }
    });
  },
  foo(param) {
    // this 是 helper 对象，在其中可以调用其他 helper 方法
    // this.ctx => context 对象
    // this.app => application 对象
    return param * 2;
  },
  money(val) {
    const lang = this.ctx.get('Accept-Language');
    if (lang.includes('zh-CN')) {
      return `￥ ${val}`;
    }
    return `$ ${val}`;
  },
};

