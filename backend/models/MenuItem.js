const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  category:    { type: String, required: true },
  image:       { type: String, default: '' },
  isVeg:       { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isBestseller:{ type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
