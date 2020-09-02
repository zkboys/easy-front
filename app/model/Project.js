'use strict';

module.exports = app => {
  const { STRING, UUID, UUIDV4 } = app.Sequelize;

  const Project = app.model.define('project', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    name: STRING(200),
    description: STRING(500),
    teamId: UUID,
  });

  // Project.sync({ force: true });
  Project.associate = function() {
    app.model.Project.belongsTo(app.model.Team);
    app.model.Project.hasMany(app.model.Dynamic);

    // 与User表是多对多关系
    app.model.Project.belongsToMany(app.model.User, {
      through: app.model.ProjectUser,
    });
  };

  return Project;
};
