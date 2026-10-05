const sequelize = require('../config/database');
require('../models/User');
require('../models/Revenue');
require('../models/Expense');
require('../models/MonthlyBudget');

async function resetDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Base SQLite réinitialisée : toutes les données ont été supprimées.');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la base SQLite :', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

resetDatabase();
