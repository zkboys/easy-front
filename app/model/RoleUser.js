'use strict';
module.exports = app => {
  const { UUID, INTEGER } = app.Sequelize;

  return app.model.define('role_user', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: UUID,
    roleId: INTEGER,
  });
};
