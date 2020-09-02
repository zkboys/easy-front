'use strict';

module.exports = app => {
  const { STRING, UUID, UUIDV4 } = app.Sequelize;

  const Category = app.model.define('category', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    projectId: UUID,
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
