const express = require('express');
const sequelize = require('../config/database');
const { getDatabaseBackupStatus } = require('../services/databaseBackup');

module.exports = function createAdminRoutes(requestMetrics) {
  const router = express.Router();

  router.get('/metrics', async (req, res) => {
    let database;
    try {
      const started = process.hrtime.bigint();
      await sequelize.query('SELECT 1');
      database = {
        status: 'connected',
        latencyMs: Number((Number(process.hrtime.bigint() - started) / 1e6).toFixed(2)),
      };
    } catch (error) {
      console.error('Échec de la vérification de santé de SQLite :', error);
      database = { status: 'error' };
    }

    return res.json({
      generatedAt: new Date().toISOString(),
      application: requestMetrics.getSnapshot(),
      database,
      backup: getDatabaseBackupStatus(),
      process: {
        memoryUsageBytes: process.memoryUsage().rss,
        nodeVersion: process.version,
      },
    });
  });

  return router;
};
