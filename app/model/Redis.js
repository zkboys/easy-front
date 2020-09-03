'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER } = app.Sequelize;

  const Redis = app.model.define('redis', {
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    key: {
      type: STRING,
      field: 'r_key',
    },
    value: {
      type: TEXT,
      field: 'r_value',
    },
  });

  // Redis.sync({ force: true });

  return Redis;
};
