# eFront

基于 eggjs 的node后端框架

## 快速开始
更多信息请查看 [egg 官方文档][egg]

### 开发

```bash
# 安装前后端依赖
$ npm run ins-all

# 单独安装后端依赖
$ npm i --registry https://registry.npm.taobao.org

# 单独安装前端依赖
$ cd front 
$ yarn 

# 前后端同时启动
$ npm run dev

# 单独启动后端
$ npm run dev-back

# 单独启动前端
$ npm run dev-front

# 浏览器访问
$ open http://localhost:4000/

# 文档
$ open http://localhost:3000/docs/#/
```

### 发布

```bash

# 前端构建
$ npm run build-front

# 安装后端依赖
$ npm install --production --registry https://registry.npm.taobao.org

# 删除前端源码
$ rm -rf front

# 项目整体打包成 tgz文件，部署时候解压即可

# 启动服务
$ npm start

# 停止服务
$ npm stop


# 服务器上一键拉取代码、构建、发布
$ npm run deploy
```
注：前端文件有缓存，前端文件更新后，也要重启后端服务。

### 数据库
不需要创建表，开发模式下 通过 `./app.js` 文件，可以进行数据库同步、初始化。

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.

## 资料
- [页面模板 egg-view-ejs](https://github.com/eggjs/egg-view-ejs)
- [数据库 sequelize](https://sequelize.org/)
- [数据库 egg-sequelize](https://github.com/eggjs/egg-sequelize)
- [路由 egg-router-plus](https://github.com/eggjs/egg-router-plus)
- [校验 egg-validate](https://github.com/eggjs/egg-validate)

## TODO
- [x] 同一路由规则下，浏览器前进后退无效
[egg]: https://eggjs.org

