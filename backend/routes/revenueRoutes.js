const express = require('express');
const router = express.Router();
const Revenue = require('../models/Revenue');

// GET /api/revenues - Index
router.get('/', async (req, res) => {
  try {
    const revenues = await Revenue.findAll({ order: [['date', 'DESC']] });
    res.json(revenues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/revenues/:id - Show
router.get('/:id', async (req, res) => {
  try {
    const revenue = await Revenue.findByPk(req.params.id);
    if (!revenue) return res.status(404).json({ error: 'Revenu non trouvé' });
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/revenues - Store
router.post('/', async (req, res) => {
  try {
    const revenue = await Revenue.create(req.body);
    res.status(201).json(revenue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/revenues/:id - Update
router.put('/:id', async (req, res) => {
  try {
    const revenue = await Revenue.findByPk(req.params.id);
    if (!revenue) return res.status(404).json({ error: 'Revenu non trouvé' });

    await revenue.update(req.body);
    res.json(revenue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/revenues/:id - Destroy
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Revenue.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Revenu non trouvé' });
    res.json({ message: 'Revenu supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
