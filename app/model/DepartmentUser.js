'use strict';
module.exports = app => {
  const { INTEGER, BIGINT, UUID } = app.Sequelize;

  return app.model.define('department_user', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: UUID,
    departmentId: INTEGER,
    isLeader: INTEGER,
    order: BIGINT,
  });
};
