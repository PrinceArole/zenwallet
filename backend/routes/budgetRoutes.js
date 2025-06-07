const express = require('express');
const router = express.Router();
const Budget = require('../models/MonthlyBudget');

// POST /api/budget
router.post('/', async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    const budget = await Budget.create({ month, year, amount });
    res.status(201).json(budget);
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/:month', async (req, res) => {
  try {
    const month = req.params.month;
    const budget = await Budget.findOne({ where: { month } });
    if (budget) {
      res.json(budget);
    } else {
      res.status(404).json({ message: 'Aucun budget trouvé pour ce mois.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
