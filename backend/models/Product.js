const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ["trendingProducts", "featuredProducts", "exclusiveOffers", "customerReviews"] // Define valid categories
  },
  rating: { type: Number, default: 0 }, // For customer reviews or product ratings
  colors: [String], // Optional array of colors for products
  availableQuantity: { type: Number, default: 1 }, // Stock availability
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL or path to the product image (e.g., "uploads/filename.jpg")
  offerEnds: { type: Date }, // For trending products with limited-time offers
  dateAdded: { type: Date, default: Date.now }, // Timestamp for when the product was added
});

module.exports = mongoose.model("Product", productSchema);