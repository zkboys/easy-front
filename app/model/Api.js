'use strict';

module.exports = app => {
  const { INTEGER, ENUM, STRING} = app.Sequelize;

  const Api = app.model.define('api', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    projectId: INTEGER,
    categoryId: INTEGER,
    name: STRING(200),
    description: STRING(500),
    method: STRING(20),
    path: STRING(200),
    status: {
      type: ENUM('00', '01'), // 后端未完成 后端已完成
      defaultValue: '00',
      allowNull: false,
      comment: '后端状态',
    },
  });

  // Api.sync({ force: true });

  Api.associate = function() {
    app.model.Api.belongsTo(app.model.Category, { onDelete: 'CASCADE' });
    app.model.Api.belongsTo(app.model.Project, { onDelete: 'CASCADE' });
  };

  return Api;
};
