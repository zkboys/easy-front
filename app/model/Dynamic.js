'use strict';

module.exports = app => {
  const { TEXT, UUID, UUIDV4 } = app.Sequelize;

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

    summary: TEXT,
    detail: TEXT,
  });

  // Dynamic.sync({force: true});

  Dynamic.associate = function() {
    // 与user一对多关系
    app.model.Dynamic.belongsTo(app.model.User);
  };

  return Dynamic;
};
