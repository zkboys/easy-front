'use strict';

module.exports = app => {
  const { INTEGER, STRING, UUID } = app.Sequelize;

  const Menu = app.model.define('menu', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    parentId: INTEGER,
    text: STRING(200),
    icon: STRING(200),
    path: STRING(200),
    url: STRING(200),
    target: STRING(200),
    order: INTEGER,
  });

  // Menu.sync({force: true});

  Menu.associate = function() {
    // 与Role表是多对多关系
    app.model.Menu.belongsToMany(app.model.Role, {
      through: app.model.RoleMenu,
    });
  };

  return Menu;
};
