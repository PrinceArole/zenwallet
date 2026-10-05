const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
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
const { startDatabaseBackupSchedule } = require('./services/databaseBackup');
const { requireAuth } = require('./middleware/requireAuth');

const app = express();
const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...configuredOrigins,
]);

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
app.use('/api/auth', authRoutes);
app.use('/api/revenues', requireAuth, revenueRoutes);
app.use('/api/expenses', requireAuth, expenseRoutes);
app.use('/api/budget', requireAuth, budgetRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API BudgetWise');
});

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
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
