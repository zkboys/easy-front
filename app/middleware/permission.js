'use strict';
module.exports = {
  admin: async (ctx, next) => {
    let { id } = ctx.params;

    if (ctx.user.id === id) return await next();

    if (!ctx.user.isAdmin) ctx.throw(403);

    await next();
  },
  team: {
    owner: async (ctx, next) => {
      let { id } = ctx.params;
      const user = ctx.user;

      if (user.isAdmin) return await next();

      const found = await user.getTeams({ where: { id } });

      if (!found || !found.length) ctx.throw(403);

      if (found[0].team_user.role === 'owner') return await next();

      ctx.throw(403);
    },
    master: async (ctx, next) => {
      let { id } = ctx.params;
      const user = ctx.user;

      if (user.isAdmin) return await next();

      const found = await user.getTeams({ where: { id } });

      if (!found || !found.length) ctx.throw(403);

      if ([ 'owner', 'master' ].includes(found[0].team_user.role)) return await next();

      ctx.throw(403);
    },
    member: async (ctx, next) => {
      let { id } = ctx.params;
      const user = ctx.user;

      if (user.isAdmin) return await next();

      const found = await user.getTeams({ where: { id } });

      if (found && found.length) return await next();

      ctx.throw(403);
    },
  },
  project: {
    owner: async (ctx, next) => {
      let { id, projectId } = ctx.params;
      if (projectId) id = projectId;

      const user = ctx.user;

      if (user.isAdmin) return await next();

      const found = await user.getProjects({ where: { id } });

      if (!found || !found.length) ctx.throw(403);

      if (found[0].project_user.role === 'owner') return await next();

      ctx.throw(403);
    },
    master: async (ctx, next) => {
      let { id, projectId } = ctx.params;
      if (projectId) id = projectId;

      const user = ctx.user;

      if (user.isAdmin) return await next();

      const found = await user.getProjects({ where: { id } });

      if (!found || !found.length) ctx.throw(403);

      if ([ 'owner', 'master' ].includes(found[0].project_user.role)) return await next();

      ctx.throw(403);
    },
    member: async (ctx, next) => {
      let { id, projectId } = ctx.params;
      if (projectId) id = projectId;

      const user = ctx.user;

      if (user.isAdmin) return await next();

      const found = await user.getProjects({ where: { id } });

      if (found && found.length) return await next();

      ctx.throw(403);
    },
  },
};
