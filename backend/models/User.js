const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
  },
}, {
  defaultScope: {
    attributes: { exclude: ['passwordHash'] },
  },
  scopes: {
    withPassword: { attributes: ['id', 'name', 'email', 'passwordHash'] },
  },
});

module.exports = User;
