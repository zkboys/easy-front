'use strict';

module.exports = app => {
  const { ENUM, STRING, TEXT, UUID, UUIDV4 } = app.Sequelize;

  const Dynamic = app.model.define('dynamic', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    userId: UUID,
    teamId: UUID,
    projectId: UUID,

    type: ENUM('create', 'update', 'delete'),
    title: STRING(100),
    summary: TEXT,
    detail: TEXT,
  });

  // Dynamic.sync({ force: true });

  Dynamic.associate = function() {

    // 归属于用户（动态：用户 = n：1）用户删除的时候，动态也删除
    app.model.Dynamic.belongsTo(app.model.User, { onDelete: 'CASCADE' });

    // 团队删除的时候，设置 dynamic.teamId = null
    app.model.Dynamic.belongsTo(app.model.Team, { onDelete: 'SET NULL' });
    app.model.Dynamic.belongsTo(app.model.Project, { onDelete: 'SET NULL' });
  };

  return Dynamic;
};
