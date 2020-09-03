'use strict';
const { Op } = require('sequelize');
const { userLink, teamLink, roleTag } = require('./util');

module.exports = {
  create: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic } = ctx.model;

    await next();

    const { id: teamId, name } = ctx.body;
    const summary = `创建了团队${teamLink({ id: teamId, name })}`;

    await Dynamic.create({ type: 'create', title: '团队动态', teamId, summary, userId: user.id });
  },

  update: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Team } = ctx.model;
    const prevTeam = await Team.findByPk(ctx.params.id);

    await next();
    const { id: teamId, name, description } = ctx.body;

    const summary = `更新了团队`;
    const detail = [];
    if (prevTeam.name !== name) detail.push(`团队名称<<->>${prevTeam.name} -->> ${name}`);
    if (prevTeam.description !== description) detail.push(`团队描述<<->>${prevTeam.description} -->> ${description}`);

    if (detail.length) {
      await Dynamic.create({ type: 'update', title: '团队动态', teamId, summary, userId: user.id, detail: detail.join('\n') });
    }
  },
  destroy: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Team } = ctx.model;
    const prevTeam = await Team.findByPk(ctx.params.id);

    await next();

    const summary = `删除了团队${teamLink(prevTeam)}`;
    await Dynamic.create({ type: 'delete', title: '团队动态', teamId: prevTeam.id, summary, userId: user.id });
  },
  addMembers: async (ctx, next) => {
    await next();

    const user = ctx.user;
    const { Dynamic, User } = ctx.model;

    const { id: teamId } = ctx.params;
    const { userIds, role } = ctx.request.body;

    const users = await User.findAll({ where: { id: { [Op.in]: userIds } } });

    const summary = `添加了成员${users.map(user => userLink(user)).join()}做为${roleTag(role)}`;
    await Dynamic.create({ type: 'create', title: '团队动态', teamId, summary, userId: user.id });
  },

  updateMember: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, User, Team } = ctx.model;

    const { id: teamId, memberId } = ctx.params;
    const { role } = ctx.request.body;

    const member = await User.findOne({
      where: {
        id: memberId,
      },
      include: {
        model: Team,
        where: { id: teamId },
      },
    });

    if (!member) return await next();

    let prevRole;
    if (member && member.teams && member.teams.length) prevRole = member.teams[0].team_user.role;

    await next();

    const summary = `修改了成员${userLink(member)}角色，由${roleTag(prevRole)}更改为${roleTag(role)}`;
    await Dynamic.create({ type: 'update', title: '团队动态', teamId, summary, userId: user.id });
  },

  destroyMember: async (ctx, next) => {
    await next();

    const user = ctx.user;
    const { Dynamic, User } = ctx.model;

    const { id: teamId, memberId } = ctx.params;

    const member = await User.findByPk(memberId);

    const summary = `移除了团队成员${userLink(member)}`;
    await Dynamic.create({ type: 'delete', title: '团队动态', teamId, summary, userId: user.id });
  },
};
