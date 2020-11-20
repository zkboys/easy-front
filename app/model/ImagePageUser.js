'use strict';
module.exports = app => {
  const { ENUM, UUID, INTEGER } = app.Sequelize;

  const ImagePageUser = app.model.define('imagePageUser', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: UUID,
    imagePageId: INTEGER,
    role: ENUM('owner', 'master', 'member'), // 创建者 管理员 成员
  });

  // ImagePageUser.sync({ force: true });

  return ImagePageUser;
};
