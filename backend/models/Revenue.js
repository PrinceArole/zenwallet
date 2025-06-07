// models/Revenue.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Revenue = sequelize.define('Revenue', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Revenue;
