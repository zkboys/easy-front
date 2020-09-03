'use strict';

module.exports = app => {
  const { INTEGER, ENUM, STRING } = app.Sequelize;

  const Param = app.model.define('param', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    projectId: INTEGER, // 项目参数 所有接口公用参数 如果是api参数，此为空
    apiId: INTEGER,
    type: ENUM('header', 'path', 'query', 'body'),
    name: STRING(200),
    key: STRING(200),
    defaultValue: STRING(200), // 默认值
    description: STRING(500),
  });

  // Param.sync({ force: true });

  Param.associate = function() {
    app.model.Param.belongsTo(app.model.Api, { onDelete: 'CASCADE' });
  };

  return Param;
};
