'use strict';

function userLink(user) {
  return `{"type": "userLink", "id": "${user.id}", "name": "${user.name}"}`;
}

function teamLink(team) {
  return `{"type": "teamLink", "id": "${team.id}", "name": "${team.name}"}`;
}

module.exports = {
  add: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic } = ctx.model;
    await next();

    const { id, name } = ctx.body;

    const summary = `创建了团队${teamLink({ id, name })}`;

    await Dynamic.create({ teamId: id, summary, userId: user.id });
  },

  update: async (ctx, next) => {
    const user = ctx.user;
    const { Dynamic, Team } = ctx.model;
    const prevTeam = await Team.findByPk(ctx.params.id);

    await next();

    const { id, name, description } = ctx.body;

    const summary = `更新了团队${teamLink({ id, name })}`;
    const detail = [];
    if (prevTeam.name !== name) detail.push(`团队名称<<->>${prevTeam.name} -->> ${name}`);
    if (prevTeam.description !== description) detail.push(`团队描述<<->>${prevTeam.description} -->> ${description}`);

    if (detail.length) {
      await Dynamic.create({ teamId: id, summary, userId: user.id, detail: detail.join('\n') });
    }
  },
};
