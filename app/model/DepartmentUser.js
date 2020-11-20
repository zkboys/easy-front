'use strict';
module.exports = app => {
  const { INTEGER, BIGINT, UUID, UUIDV4 } = app.Sequelize;

  return app.model.define('departmentUser', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    userId: UUID,
    departmentId: INTEGER,
    isLeader: INTEGER,
    order: BIGINT,
  });
};
