const router = require('express').Router();
const Restaurant = require('../models/Restaurant');

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const { search, cuisine } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (cuisine && cuisine !== 'all') query.cuisine = { $regex: cuisine, $options: 'i' };
    const restaurants = await Restaurant.find(query).sort({ rating: -1 });
    res.json(restaurants);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET single restaurant
router.get('/:id', async (req, res) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
