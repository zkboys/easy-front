'use strict';
module.exports = {
  admin: async (ctx, next) => {
    let { id } = ctx.params;

    if (ctx.user.id === id) return await next();

    if (!ctx.user.isAdmin) ctx.throw(403);

    await next();
  },
  team: {
    ...identityPermission('teamId', 'getTeams', 'teamUser'),
  },
  imagePage: {
    ...identityPermission('imagePageId', 'getImagePages', 'imagePageUser'),
  },
  project: {
    ...identityPermission('projectId', 'getProjects', 'projectUser'),
  },
};

function identityPermission(idField, getItemMethod, userObj) {
  return {
    owner: identity([ 'owner' ], idField, getItemMethod, userObj),
    master: identity([ 'owner', 'master' ], idField, getItemMethod, userObj),
    member: identity([ 'owner', 'master', 'member' ], idField, getItemMethod, userObj),
  };
}

// 身份
function identity(identities, idField, getItemMethod, userObj) {

  return async (ctx, next) => {
    // 获取id
    // /xxx/:id 或者 /xxx/:[idField]
    let { id } = ctx.params;
    let itemId = ctx.params[idField];
    if (itemId) id = itemId;

    const user = ctx.user;

    if (user.isAdmin) return await next();

    const found = await user[getItemMethod]({ where: { id } });

    if (!found || !found.length) ctx.throw(403);

    if (identities.includes(found[0][userObj].role)) return await next();

    ctx.throw(403);
  };
}
