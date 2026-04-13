const router = require('express').Router();
const MenuItem = require('../models/MenuItem');

// GET menu items for a restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId, isAvailable: true });
    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json({ items, grouped });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
