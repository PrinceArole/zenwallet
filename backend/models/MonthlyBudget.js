const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('MonthlyBudget', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE',
  },
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
