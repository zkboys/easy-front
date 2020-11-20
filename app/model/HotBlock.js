'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const HotBlock = app.model.define('hotBlock', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    imagePageId: INTEGER,

    name: STRING(100),
    action: STRING(100),
    actionParam: STRING(100),
  });

  // HotBlock.sync({ force: true });

  HotBlock.associate = function() {

    // 归属于图片页面（热区：图片页面 = n：1）图片页面删除的时候，热区也删除
    app.model.HotBlock.belongsTo(app.model.ImagePage, { onDelete: 'CASCADE' });
  };

  return HotBlock;
};
