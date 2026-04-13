const router = require('express').Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// ── Dashboard stats ──
router.get('/stats', async (req, res) => {
  try {
    const [users, restaurants, orders, revenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    res.json({ users, restaurants, orders, revenue: revenue[0]?.total || 0, recentOrders });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ── Restaurants CRUD ──
router.get('/restaurants', async (req, res) => {
  const list = await Restaurant.find().sort({ createdAt: -1 });
  res.json(list);
});
router.post('/restaurants', async (req, res) => {
  try { res.status(201).json(await Restaurant.create(req.body)); }
  catch(err) { res.status(400).json({ message: err.message }); }
});
router.put('/restaurants/:id', async (req, res) => {
  try { res.json(await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch(err) { res.status(400).json({ message: err.message }); }
});
router.delete('/restaurants/:id', async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  await MenuItem.deleteMany({ restaurant: req.params.id });
  res.json({ message: 'Deleted' });
});

// ── Menu Items CRUD ──
router.get('/menu', async (req, res) => {
  const items = await MenuItem.find().populate('restaurant', 'name').sort({ createdAt: -1 });
  res.json(items);
});
router.post('/menu', async (req, res) => {
  try { res.status(201).json(await MenuItem.create(req.body)); }
  catch(err) { res.status(400).json({ message: err.message }); }
});
router.put('/menu/:id', async (req, res) => {
  try { res.json(await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch(err) { res.status(400).json({ message: err.message }); }
});
router.delete('/menu/:id', async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ── Orders management ──
router.get('/orders', async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch(err) { res.status(400).json({ message: err.message }); }
});

// ── Users list ──
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

module.exports = router;
