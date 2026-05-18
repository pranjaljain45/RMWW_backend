const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  gender: String,
  category: String,
  subcategory: String,
  imageUrl: { type: String, required: true },      // Cloudinary URL
  public_id: { type: String, required: true },     // Cloudinary ID
  description: String,
  stylistNotes: String,
  materialCare: String,
  
  // Deprecated: keeping for backward compatibility
  size: String,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

