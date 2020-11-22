'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, BOOLEAN } = app.Sequelize;

  const HotBlockFile = app.model.define('hotBlockFile', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    name: STRING(200),
    url: STRING(100), // 热区文件发布地址
    description: STRING(500),
    teamId: INTEGER,
  });

  // HotBlockFile.sync({ force: true });
  HotBlockFile.associate = function() {
    app.model.HotBlockFile.belongsTo(app.model.Team, { onDelete: 'CASCADE' });
    app.model.HotBlockFile.belongsTo(app.model.User, { onDelete: 'SET NULL' });

    app.model.HotBlockFile.hasMany(app.model.ImagePage);
    app.model.HotBlockFile.hasMany(app.model.Dynamic);
  };

  return HotBlockFile;
};
