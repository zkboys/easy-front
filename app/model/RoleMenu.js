'use strict';
module.exports = app => {
  const { INTEGER } = app.Sequelize;

  return app.model.define('role_menu', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    roleId: INTEGER,
    menuId: INTEGER,
  });
};
