'use strict';
module.exports = app => {
  const { ENUM, UUID, UUIDV4 } = app.Sequelize;

  return app.model.define('team_user', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    userId: UUID,
    teamId: UUID,
    role: ENUM('owner', 'master', 'member'), // 创建者 管理员 成员
  });
};
