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
    app.model.Dynamic.belongsTo(app.model.User);
    app.model.Dynamic.belongsTo(app.model.Team);
    app.model.Dynamic.belongsTo(app.model.Project);
  };

  return Dynamic;
};
