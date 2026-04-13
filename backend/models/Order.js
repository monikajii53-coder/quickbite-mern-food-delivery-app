const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:      String,
  price:     Number,
  quantity:  { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  restaurantName: String,
  items:        [orderItemSchema],
  subtotal:     Number,
  deliveryFee:  Number,
  total:        Number,
  status:       { type: String, enum: ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'], default: 'pending' },
  address:      { type: String, required: true },
  paymentMethod:{ type: String, default: 'Cash on Delivery' },
  notes:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
