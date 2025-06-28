const mongoose = require("mongoose");

const wearSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String, // lehenga, sherwani, etc.
  subcategory: String, // optional
  imageUrl: String, // path to image
  description: String,
  stylistNotes: String,
  materialCare: String,
  size: String,
  ownerName: String,
  availableDays: Number,
});

module.exports = mongoose.model("Wear", wearSchema);
