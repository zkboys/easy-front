'use strict';

module.exports = app => {
  const { STRING, UUID, UUIDV4 } = app.Sequelize;

  const Api = app.model.define('api', {
    id: {
      type: UUID,
      allowNull: false,
      primaryKey: true,
      unique: true,
      defaultValue: UUIDV4,
    },
    categoryId: UUID,
    name: STRING(200),
    description: STRING(500),
  });

  // Api.sync({ force: true });

  Api.associate = function() {
    app.model.Api.belongsTo(app.model.Category, { onDelete: 'CASCADE' });
  };

  return Api;
};
