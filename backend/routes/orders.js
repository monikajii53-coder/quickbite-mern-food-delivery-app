const router = require('express').Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST place order
router.post('/', protect, async (req, res) => {
  try {
    const { restaurant, restaurantName, items, subtotal, deliveryFee, total, address, notes } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });
    const order = await Order.create({
      user: req.user._id, restaurant, restaurantName,
      items, subtotal, deliveryFee, total, address, notes,
    });
    res.status(201).json(order);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET my orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
