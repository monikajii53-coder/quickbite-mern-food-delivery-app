const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  cuisine:     { type: String, required: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  address:     { type: String, default: '' },
  rating:      { type: Number, default: 4.0, min: 1, max: 5 },
  deliveryTime:{ type: String, default: '30-45 min' },
  deliveryFee: { type: Number, default: 2.99 },
  minOrder:    { type: Number, default: 10 },
  isOpen:      { type: Boolean, default: true },
  tags:        [String],
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
