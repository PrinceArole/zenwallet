const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('MonthlyBudget', {
  month: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

module.exports = Budget;
