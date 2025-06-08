// app.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/database');
const Revenue = require('./models/Revenue');
const Expense = require('./models/Expense');
const revenueRoutes = require('./routes/revenueRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const Budget = require('./models/MonthlyBudget');
const { Op } = require('sequelize');
const budgetRoutes = require('./routes/budgetRoutes');



// Chargement des variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'https://zenwallet-app.onrender.com', // 🔐 domaine autorisé
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use('/api/revenues', revenueRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
// Routes de test
app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API BudgetWise');
});

// Connexion à la base de données
sequelize.authenticate()
  .then(() => {
    console.log('Connexion à MySQL réussie');
  })
  .catch(err => {
    console.error('Erreur de connexion à MySQL :', err);
  });

  sequelize.sync({ alter: true })
  .then(() => {
    console.log(' Modèles synchronisés avec la base de données');
  })
  .catch(err => {
    console.error(' Erreur lors de la synchronisation des modèles :', err);
  });

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
