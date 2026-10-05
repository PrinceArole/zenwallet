const express = require('express');
const Revenue = require('../models/Revenue');

const router = express.Router();
const editableFields = ['title', 'amount', 'date', 'source'];

router.get('/', async (req, res) => {
  try {
    const revenues = await Revenue.findAll({
      where: { user_id: req.userId },
      order: [['date', 'DESC']],
    });
    return res.json(revenues);
  } catch (error) {
    console.error('Erreur lors de la récupération des revenus :', error);
    return res.status(500).json({ error: 'Impossible de récupérer les revenus.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const revenue = await Revenue.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!revenue) return res.status(404).json({ error: 'Revenu non trouvé.' });
    return res.json(revenue);
  } catch (error) {
    console.error('Erreur lors de la récupération du revenu :', error);
    return res.status(500).json({ error: 'Impossible de récupérer ce revenu.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const revenue = await Revenue.create({
      ...Object.fromEntries(editableFields.map((field) => [field, req.body[field]])),
      user_id: req.userId,
    });
    return res.status(201).json(revenue);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const revenue = await Revenue.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!revenue) return res.status(404).json({ error: 'Revenu non trouvé.' });

    await revenue.update(Object.fromEntries(
      editableFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    ));
    return res.json(revenue);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Revenue.destroy({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!deleted) return res.status(404).json({ error: 'Revenu non trouvé.' });
    return res.json({ message: 'Revenu supprimé.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du revenu :', error);
    return res.status(500).json({ error: 'Impossible de supprimer ce revenu.' });
  }
});

module.exports = router;
