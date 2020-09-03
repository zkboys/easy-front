'use strict';

module.exports = app => {
  const { STRING, BOOLEAN, INTEGER } = app.Sequelize;

  const Role = app.model.define('role', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: STRING(200),
    description: STRING(500),
    frozen: BOOLEAN, // 冻结，不可删除、不可修改
  });

  // Role.sync({force: true});

  Role.associate = function() {
    // 与User表是多对多关系
    app.model.Role.belongsToMany(app.model.User, {
      through: app.model.RoleUser,
    });

    // 与permission表示多对多关系
    app.model.Role.belongsToMany(app.model.Permission, {
      through: app.model.RolePermission,
    });

    // 与Menu表是多对多关系
    app.model.Role.belongsToMany(app.model.Menu, {
      through: app.model.RoleMenu,
    });

  };

  return Role;
};
