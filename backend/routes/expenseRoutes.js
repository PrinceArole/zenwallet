const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();
const editableFields = ['title', 'amount', 'date', 'category', 'tag'];

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { user_id: req.userId },
      order: [['date', 'DESC']],
    });
    return res.json(expenses);
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses :', error);
    return res.status(500).json({ error: 'Impossible de récupérer les dépenses.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!expense) return res.status(404).json({ error: 'Dépense non trouvée.' });
    return res.json(expense);
  } catch (error) {
    console.error('Erreur lors de la récupération de la dépense :', error);
    return res.status(500).json({ error: 'Impossible de récupérer cette dépense.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create({
      ...Object.fromEntries(editableFields.map((field) => [field, req.body[field]])),
      user_id: req.userId,
    });
    return res.status(201).json(expense);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!expense) return res.status(404).json({ error: 'Dépense non trouvée.' });

    await expense.update(Object.fromEntries(
      editableFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    ));
    return res.json(expense);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.destroy({
      where: { id: req.params.id, user_id: req.userId },
    });
    if (!deleted) return res.status(404).json({ error: 'Dépense non trouvée.' });
    return res.json({ message: 'Dépense supprimée.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense :', error);
    return res.status(500).json({ error: 'Impossible de supprimer cette dépense.' });
  }
});

module.exports = router;
