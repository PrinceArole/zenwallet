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
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']],
    },
  },
}, {
  defaultScope: {
    attributes: { exclude: ['passwordHash'] },
  },
  scopes: {
    withPassword: { attributes: ['id', 'name', 'email', 'passwordHash', 'role'] },
  },
});

module.exports = User;
