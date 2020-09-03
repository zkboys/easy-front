'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Project = app.model.define('project', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: STRING(200),
    description: STRING(500),
    teamId: INTEGER,
  });

  // Project.sync({ force: true });
  Project.associate = function() {
    app.model.Project.belongsTo(app.model.Team, { onDelete: 'CASCADE' });

    app.model.Project.hasMany(app.model.Dynamic);
    app.model.Project.hasMany(app.model.Category);
    app.model.Project.hasMany(app.model.Api);

    // 与User表是多对多关系
    app.model.Project.belongsToMany(app.model.User, {
      through: app.model.ProjectUser,
    });
  };

  return Project;
};
