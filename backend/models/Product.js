const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  colors: [String],
  availableQuantity: { type: Number, default: 1 },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
