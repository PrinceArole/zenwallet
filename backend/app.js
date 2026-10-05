const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const { DataTypes } = require('sequelize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
require('./models/User');
require('./models/Revenue');
require('./models/Expense');
require('./models/MonthlyBudget');
const authRoutes = require('./routes/authRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { createRequestMetrics } = require('./services/requestMetrics');
const { startDatabaseBackupSchedule } = require('./services/databaseBackup');
const { requireAuth, requireAdmin } = require('./middleware/requireAuth');

const app = express();
const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://zenwallet.onrender.com',
  'https://zenwallet-app.onrender.com',
  ...configuredOrigins,
]);
const requestMetrics = createRequestMetrics();

async function migrateUserOwnershipColumns() {
  const queryInterface = sequelize.getQueryInterface();

  for (const tableName of ['Revenues', 'Expenses', 'MonthlyBudgets']) {
    const columns = await queryInterface.describeTable(tableName);
    if (!columns.user_id) {
      await queryInterface.addColumn(tableName, 'user_id', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      });
      console.log(`Colonne user_id ajoutée à ${tableName}.`);
    }
  }

  const userColumns = await queryInterface.describeTable('Users');
  if (!userColumns.role) {
    await queryInterface.addColumn('Users', 'role', {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user',
    });
    console.log('Colonne role ajoutée à Users.');
  }
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origine non autorisée par CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(requestMetrics.middleware);
app.use('/api/auth', authRoutes);
app.use('/api/revenues', requireAuth, revenueRoutes);
app.use('/api/expenses', requireAuth, expenseRoutes);
app.use('/api/budget', requireAuth, budgetRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes(requestMetrics));

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API BudgetWise');
});

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await migrateUserOwnershipColumns();
    console.log('Connexion à SQLite réussie et modèles synchronisés.');
    try {
      startDatabaseBackupSchedule();
    } catch (err) {
      console.error('Erreur lors de la planification des sauvegardes SQLite :', err);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le backend :', error);
    process.exitCode = 1;
  }
}

startServer();
