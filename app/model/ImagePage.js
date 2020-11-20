'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, BOOLEAN } = app.Sequelize;

  const ImagePage = app.model.define('imagePage', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: STRING(200),
    url: STRING(100), // 页面发布之后的地址
    src: STRING(500), // 基础图片地址
    quality: { // 图片压缩比 1 - 100
      type: INTEGER,
      defaultValue: 100,
    },
    curHeight: {  // 相对裁剪高度
      type: INTEGER,
      defaultValue: 400,
    },
    description: STRING(500),
    teamId: INTEGER,
  });

  // ImagePage.sync({ force: true });
  ImagePage.associate = function() {
    app.model.ImagePage.belongsTo(app.model.Team, { onDelete: 'CASCADE' });

    app.model.ImagePage.hasMany(app.model.HotBlock);

    // 与User表是多对多关系
    app.model.ImagePage.belongsToMany(app.model.User, {
      through: app.model.ImagePageUser,
    });
  };

  return ImagePage;
};
