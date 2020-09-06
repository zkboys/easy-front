'use strict';

module.exports = app => {
  const { BOOLEAN, INTEGER, ENUM, STRING } = app.Sequelize;

  const Param = app.model.define('param', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    parentId: INTEGER, // object array 等多层级结构
    projectId: INTEGER, // 项目参数 所有接口公用参数 如果是api参数，projectId为空
    apiId: INTEGER, // 如果是项目参数，apiId为空
    type: ENUM('header', 'path', 'query', 'body', 'response-header', 'response-body'),
    name: STRING(200), // 参数中文名
    field: STRING(200), // 参数字段名
    value: STRING(200),
    valueType: {
      type: ENUM('number', 'string', 'boolean', 'array', 'object'),
      defaultValue: 'string',
    },
    required: BOOLEAN,
    defaultValue: STRING(200), // 默认值
    description: STRING(500),
    mock: STRING(500), // mock 配置
  });

  // Param.sync({ force: true });

  Param.associate = function() {
    app.model.Param.belongsTo(app.model.Api, { onDelete: 'CASCADE' });
  };

  return Param;
};
