const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true }, // Removed enum to allow flexible categories
  rating: { type: Number, default: 0, min: 0, max: 5 },
  colors: [String],
  availableQuantity: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0, min: 0 },
  description: { type: String, required: true, trim: true },
  imageId: { type: mongoose.Types.ObjectId, required: false }, // GridFS file ID
  offerEnds: { type: Date },
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);