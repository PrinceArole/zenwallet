const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const User = require('../models/User');

async function setUserRole() {
  const email = typeof process.argv[2] === 'string' ? process.argv[2].trim().toLowerCase() : '';
  const role = process.argv[3];

  if (!email || !['admin', 'user'].includes(role)) {
    console.error('Usage : npm run user:role -- <adresse-email> <admin|user>');
    process.exitCode = 1;
    return;
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const queryInterface = sequelize.getQueryInterface();
    const columns = await queryInterface.describeTable('Users');
    if (!columns.role) {
      await queryInterface.addColumn('Users', 'role', {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'user',
      });
    }

    const [updatedCount] = await User.update({ role }, { where: { email } });
    if (!updatedCount) {
      console.error(`Aucun compte trouvé pour ${email}.`);
      process.exitCode = 1;
      return;
    }

    console.log(`Rôle « ${role} » attribué au compte ${email}.`);
  } catch (error) {
    console.error('Impossible de modifier le rôle du compte :', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setUserRole();
