const express = require('express');
const Budget = require('../models/MonthlyBudget');

const router = express.Router();

router.post('/', async (req, res) => {
  const { month, year, amount } = req.body;
  if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Le mois doit être au format AAAA-MM.' });
  }

  try {
    const existing = await Budget.findOne({
      where: { month, user_id: req.userId },
    });
    if (existing) {
      await existing.update({ year, amount });
      return res.json(existing);
    }

    const budget = await Budget.create({ month, year, amount, user_id: req.userId });
    return res.status(201).json(budget);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!budget) return res.status(404).json({ message: 'Aucun budget trouvé.' });

    const { month, year, amount } = req.body;
    if (month !== undefined && (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month))) {
      return res.status(400).json({ error: 'Le mois doit être au format AAAA-MM.' });
    }

    await budget.update({ month, year, amount });
    return res.json(budget);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/:month', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: { month: req.params.month, user_id: req.userId },
    });
    if (!budget) {
      return res.status(404).json({ message: 'Aucun budget trouvé pour ce mois.' });
    }
    return res.json(budget);
  } catch (error) {
    console.error('Erreur lors de la récupération du budget :', error);
    return res.status(500).json({ error: 'Impossible de récupérer le budget.' });
  }
});

module.exports = router;
