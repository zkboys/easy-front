'use strict';

module.exports = app => {
  const { STRING, UUID, UUIDV4 } = app.Sequelize;

  const Team = app.model.define('team', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    name: STRING(200),
    description: STRING(500),
  });

  // Team.sync({ force: true });
  Team.associate = function() {
    // 与Team一对多关系
    app.model.Team.hasMany(app.model.Project);

    // 与User表是多对多关系
    app.model.Team.belongsToMany(app.model.User, {
      through: app.model.TeamUser,
    });
  };

  return Team;
};
