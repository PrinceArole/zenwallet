// routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');


// GET /api/expense - Index
router.get('/', async (req, res) => {
  try {
    const expense = await Expense.findAll({ order: [['date', 'DESC']] });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ➕ Ajouter une dépense
router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/expense/:id - Show
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Revenu non trouvé' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔁 Récupérer toutes les dépenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.findAll({ order: [['date', 'DESC']] });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// PUT /api/expenses/:id - Update
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Revenu non trouvé' });

    await expense.update(req.body);
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ❌ Supprimer une dépense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.destroy({ where: { id: req.params.id } });
    res.json({ deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
