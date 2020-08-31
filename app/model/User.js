'use strict';

module.exports = app => {
  const { STRING, BOOLEAN, TEXT, INTEGER, UUID, UUIDV4 } = app.Sequelize;

  const User = app.model.define('user', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    isAdmin: BOOLEAN,
    account: STRING(20),
    jobNumber: STRING(20),
    password: STRING(100),
    name: STRING(20),
    email: STRING(100),
    mobile: STRING(20),
    gender: INTEGER, // 1 男 2 女
    avatar: TEXT('long'),
    position: STRING(50),
    status: INTEGER,
    enable: INTEGER,
    qrCode: STRING(200),
  });

  // User.sync({ force: true });

  User.associate = function() {
    // 与Role存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Role, {
      through: app.model.RoleUser,
    });

    // 与Department存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Department, {
      through: app.model.DepartmentUser,
    });

    // 与Team存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Team, {
      through: app.model.TeamUser,
    });

    // 与Project存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Project, {
      through: app.model.ProjectUser,
    });

    // 与Dynamic一对多关系
    app.model.User.hasMany(app.model.Dynamic);
  };

  return User;
};
