'use strict';

module.exports = app => {
  const { UUID, INTEGER, ENUM, STRING } = app.Sequelize;

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
    userId: UUID,
    name: STRING(200),
    description: STRING(500),
    method: STRING(20),
    path: STRING(200),
    responseBodyType: {
      type: ENUM('json-object', 'json-array', 'raw'),
      defaultValue: 'json-object',
    },
    status: {
      type: ENUM('00', '01'), // 接口未完成 接口已全部配置完成，可以使用了
      defaultValue: '00',
      allowNull: false,
      comment: '后端状态',
    },
  });

  // Api.sync({ force: true });

  Api.associate = function() {
    app.model.Api.belongsTo(app.model.Category, { onDelete: 'CASCADE' });
    app.model.Api.belongsTo(app.model.Project, { onDelete: 'CASCADE' });
    app.model.Api.belongsTo(app.model.User, { onDelete: 'CASCADE' });
    app.model.Api.hasMany(app.model.Param);
  };

  return Api;
};
