'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Category = app.model.define('category', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    projectId: INTEGER,
    name: STRING(200),
    description: STRING(500),
  });

  // Category.sync({ force: true });

  Category.associate = function() {
    app.model.Category.belongsTo(app.model.Project, { onDelete: 'CASCADE' });
    app.model.Category.hasMany(app.model.Api);
  };

  return Category;
};
