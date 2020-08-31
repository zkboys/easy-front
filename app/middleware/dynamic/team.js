'use strict';

function userLink(user) {
  return `{type: 'userLink', id: '${user.id}', name: '${user.name}'}`;
}

function teamLink(team) {
  return `{type: 'teamLink', id: '${team.id}', name: '${team.name}'}`;
}

module.exports = {
  add: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic } = ctx.model;
    await next();

    const { id, name } = ctx.body;

    const title = `创建了团队${teamLink({ id, name })}`;

    await Dynamic.create({ teamId: id, title, userId: user.id });
  },

  update: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic } = ctx.model;
    await next();

    const { id, name } = ctx.body;

    const title = `更新了团队${teamLink({ id, name })}`;

    await Dynamic.create({ teamId: id, title, userId: user.id });
  },
};
