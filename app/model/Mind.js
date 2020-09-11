'use strict';

module.exports = app => {
  const { BOOLEAN, INTEGER, TEXT, ENUM, STRING } = app.Sequelize;

  const Mind = app.model.define('mind', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    parentId: INTEGER, //  树状结构
    projectId: INTEGER, // 所属项目
    title: STRING(200),
    value: TEXT('long'),
  });

  // Mind.sync({ force: true });

  Mind.associate = function() {
    app.model.Mind.belongsTo(app.model.Project, { onDelete: 'CASCADE' });
  };

  return Mind;
};
