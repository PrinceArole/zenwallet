const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const sequelize = require('../config/database');
const User = require('../models/User');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const MonthlyBudget = require('../models/MonthlyBudget');

const sourcePath = path.join(__dirname, '..', 'database.sqlite');
const models = [
  ['Users', User],
  ['Revenues', Revenue],
  ['Expenses', Expense],
  ['MonthlyBudgets', MonthlyBudget],
];

function readAll(database, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, parameters, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function closeSqlite(database) {
  return new Promise((resolve, reject) => {
    database.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function openSqlite(databasePath) {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(databasePath, sqlite3.OPEN_READONLY, (error) => {
      if (error) reject(error);
      else resolve(database);
    });
  });
}

function mapSqliteRow(model, row) {
  return Object.entries(model.rawAttributes).reduce((mapped, [attributeName, attribute]) => {
    const columnName = attribute.field || attributeName;
    if (Object.prototype.hasOwnProperty.call(row, columnName)) {
      mapped[attributeName] = row[columnName];
    }
    return mapped;
  }, {});
}

async function migrateSqliteToMysql() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Base SQLite introuvable : ${sourcePath}`);
  }

  let sqlite;
  try {
    sqlite = await openSqlite(sourcePath);
    await sequelize.authenticate();
    await sequelize.sync();

    const destinationCounts = await Promise.all(
      models.map(async ([tableName, model]) => [tableName, await model.count()])
    );
    const populatedTables = destinationCounts.filter(([, count]) => count > 0);
    if (populatedTables.length > 0) {
      throw new Error(
        `La base MySQL doit être vide avant la migration. Tables non vides : ${
          populatedTables.map(([tableName]) => tableName).join(', ')
        }.`
      );
    }

    const sourceTableRows = await readAll(
      sqlite,
      "SELECT name FROM sqlite_master WHERE type = 'table'"
    );
    const sourceTables = new Set(sourceTableRows.map(({ name }) => name));
    const sourceData = await Promise.all(models.map(async ([tableName, model]) => {
      if (!sourceTables.has(tableName)) return [tableName, model, []];
      const rows = await readAll(sqlite, `SELECT * FROM "${tableName}"`);
      return [tableName, model, rows.map((row) => mapSqliteRow(model, row))];
    }));

    const importedCounts = await sequelize.transaction(async (transaction) => {
      const counts = [];
      for (const [tableName, model, rows] of sourceData) {
        if (rows.length > 0) {
          await model.bulkCreate(rows, { transaction, validate: true });
        }
        counts.push([tableName, rows.length]);
      }
      return counts;
    });

    console.log('Migration SQLite vers MySQL terminée :');
    for (const [tableName, count] of importedCounts) {
      console.log(`- ${tableName} : ${count} ligne(s)`);
    }
  } finally {
    try {
      if (sqlite) await closeSqlite(sqlite);
    } finally {
      await sequelize.close();
    }
  }
}

migrateSqliteToMysql().catch((error) => {
  console.error('Échec de la migration SQLite vers MySQL :', error);
  process.exitCode = 1;
});
