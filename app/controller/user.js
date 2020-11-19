'use strict';
const { Op } = require('sequelize');
const Controller = require('egg').Controller;
const jwt = require('jsonwebtoken');
const { getWeChatUsers } = require('../util/index');

module.exports = class UserController extends Controller {
  // 登录
  async login(ctx) {
    ctx.validate({
      account: 'string',
      password: 'string',
    }, ctx.request.body);

    const { User } = ctx.model;
    const { user: userService } = ctx.service;
    const errorMessage = '用户名或密码错误';

    const { account, password } = ctx.request.body;

    const user = await User.findOne({ where: { account } });
    if (!user) return ctx.fail(errorMessage);

    const verifyPassword = userService.comparePassword(password, user.password);
    if (!verifyPassword) return ctx.fail(errorMessage);

    const { secret, expire, cookieName } = ctx.app.config.jwt;
    const { redis } = ctx.app;
    // expiresIn 单位 秒
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: expire });
    user.token = token;

    ctx.cookies.set(cookieName, token,
      {
        maxAge: expire * 1000, // cookie有效时长 单位 毫秒s
        httpOnly: true, // 是否只用于http请求中获取
        overwrite: false, // 是否允许重写
      });

    // 存储到redis，退出登录会用到
    await redis.set(token, token);

    return ctx.success(userService.safeUser(user));
  }

  // 退出登录接口
  async logout(ctx) {
    const { redis } = ctx.app;
    const { cookieName } = ctx.app.config.jwt;

    const token = ctx.userToken;

    await redis.del(token);

    ctx.cookies.set(cookieName, null);

    ctx.success();
  }

  // 用户注册
  async create(ctx) {
    const requestBody = ctx.request.body;
    const User = ctx.model.User;
    const userService = ctx.service.user;

    ctx.validate({
      account: 'string',
      name: 'string',
      password: 'string',
    }, requestBody);

    const { password, account } = requestBody;

    const foundUser = await User.findOne({ where: { account } });
    if (foundUser) return ctx.fail('此用户名已存在');

    const ePassword = userService.encryptPassword(password);

    const savedUser = await User.create({ ...requestBody, password: ePassword });

    return ctx.success(savedUser);
  }

  // 获取所有用户
  async index(ctx) {
    const { user: userService } = ctx.service;

    const users = await userService.getUsers();
    ctx.success({ rows: users, count: users.length });
  }

  // 获取用户详情
  async show(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;

    const { User, Department } = ctx.model;

    const result = await User.findByPk(id, { include: Department });

    ctx.success(result);
  }

  // 更新用户
  async update(ctx) {
    const requestBody = ctx.request.body;
    ctx.validate({
      id: 'string',
    }, ctx.params);

    ctx.validate({
      account: 'string',
      password: 'string?',
      email: 'string',
    }, requestBody);

    const { id } = ctx.params;
    const { account, password, email } = requestBody;

    const { User } = ctx.model;
    const { user: userService } = ctx.service;

    const user = await User.findByPk(id);
    if (!user) return ctx.fail('用户不存在或已删除！');

    if (user.frozen) return ctx.fail('固定用户不能修改！');

    const exitName = await User.findOne({ where: { account } });
    if (exitName && exitName.id !== id) return ctx.fail('此用户名已被占用！');

    const exitEmail = await User.findOne({ where: { email } });
    if (exitEmail && exitEmail.id !== id) return ctx.fail('此邮箱已被占用！');

    const userData = { ...requestBody };
    if (password) {
      userData.password = userService.encryptPassword(password);
    }

    const result = await user.update(userData);

    ctx.success(result);
  }

  // 删除用户
  async destroy(ctx) {
    ctx.validate({
      id: 'string',
    }, ctx.params);

    const { id } = ctx.params;
    const { User } = ctx.model;

    const user = await User.findByPk(id);
    if (user.frozen) return ctx.fail('固定用户不能删除！');

    const result = await User.destroy({ where: { id } });

    ctx.success(result);
  }

  // 修改密码
  async updatePassword(ctx) {
    ctx.validate({
      oldPassword: 'string',
      password: 'string?',
    }, ctx.request.body);

    const { oldPassword, password } = ctx.request.body;

    const currentUser = ctx.user;
    const userService = ctx.service.user;

    const isSame = userService.comparePassword(oldPassword, currentUser.password);

    if (!isSame) return ctx.fail('原密码输入错误！');

    const hashPassword = userService.encryptPassword(password);

    await currentUser.update({ password: hashPassword });

    ctx.success(true);
  }

  // 同步微信用户
  async syncWeChat(ctx) {
    const data = await getWeChatUsers();
    const { Department, User, Role, DepartmentUser } = ctx.model;

    const users = []; // 所有用户
    const departs = []; // 所有部门
    data.forEach(item => {
      const {
        type,
        name,
        alias,
        id,
        parentId,
        order,
        department,
        mobile,
        gender,
        email,
        avatar,
        position,
        status,
        enable,
        is_leader_in_dept,
        qr_code,
      } = item;

      const account = email ? email.replace('@suixingpay.com', '') : '';

      if (type === 'depart') {
        departs.push({
          id,
          parentId,
          order,
          name,
        });
      } else {
        users.push({
          id,

          department, // 数组 多个 部门
          is_leader_in_dept, // 多个 是否是leader
          order, // 多个

          name,
          jobNumber: alias,
          account,
          password: '123456',
          mobile,
          gender,
          email,
          avatar,
          position,
          status,
          enable,
          qrCode: qr_code,
        });
      }
    });

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 处理部门
      for (const depart of departs) {
        const { id } = depart;
        const dep = await Department.findByPk(id, { transaction });

        // 微信新增了部门
        if (!dep) {
          await Department.create(depart, { transaction });
        } else {

          // 部门存在，进行更新
          await dep.update(depart, { transaction });
        }
      }

      // 处理用户
      for (const user of users) {
        const { id, department, is_leader_in_dept, order } = user;
        const u = await User.findByPk(id, { transaction });

        // 微信新增了用户
        let newUser;
        if (!u) {
          // 添加用户，并设置为员工角色
          const role = await Role.findOne({ where: { name: '员工' }, transaction });
          newUser = await role.createUser(user, { transaction });
        } else {
          // 原用户，更新属性
          newUser = await u.update(user, { transaction });
        }

        // 更新人员 与 部门关系
        await DepartmentUser.destroy({ where: { userId: newUser.id }, transaction });

        if (department && department.length) {
          for (let i = 0; i < department.length; i++) {
            const depId = department[i];

            await DepartmentUser.create({
              userId: newUser.id,
              departmentId: depId,
              isLeader: is_leader_in_dept[i],
              order: order[i],
            }, { transaction });
          }
        }
      }

      await transaction.commit();
      ctx.success();
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
    ctx.success(true);
  }

  // 关联角色
  async relateUserRoles(ctx) {
    const reqBody = ctx.request.body;
    ctx.validate({
      userId: 'string',
      roleIds: 'array',
    }, reqBody);

    const { userId, roleIds } = reqBody;

    const { RoleUser } = ctx.model;

    // 多次数据库操作，进行事务处理
    let transaction;
    try {
      transaction = await ctx.model.transaction();

      // 删除原有关联
      await RoleUser.destroy({ where: { userId }, transaction });

      // 插入新的关联
      const userRoles = roleIds.map(roleId => ({ userId, roleId }));
      await RoleUser.bulkCreate(userRoles, { transaction });

      await transaction.commit();

      ctx.success();
    } catch (e) {
      if (transaction) await transaction.rollback();

      throw e;
    }
  }

  // 获取当前登录用户菜单
  async sessionUserMenus(ctx) {
    const user = ctx.user;

    // 获取所有角色
    const roles = await user.getRoles();
    const menus = [];

    for (const role of roles) {

      // 获取所有角色对应的菜单
      const ms = await role.getMenus();
      ms.forEach(item => {
        if (!menus.find(it => it.id === item.id)) {
          menus.push(item);
        }
      });
    }

    ctx.success(menus);
  }

  // 上传用户头像
  async uploadUserAvatar(ctx) {
    const user = ctx.user;

    // 获取文件流
    const stream = await this.ctx.getFileStream();

    const avatar = await ctx.helper.streamToUploadFile(stream, 'upload/avatar');

    await user.update({ avatar });

    ctx.success(avatar);
  }
};
