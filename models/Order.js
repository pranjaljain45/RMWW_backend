const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // Firebase UID
  items: [
    {
      productId: String,
      name: String,
      quantity: Number,
      price: Number,
      imageUrl: String
    }
  ],
  totalAmount: Number,
  status: { type: String, default: "Placed" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
