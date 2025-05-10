// models/Order.js (Admin backend, port 5001)
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true },
      imageUrl: { type: String },
      color: { type: String },
    },
  ],
  shippingInfo: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  deliveryType: { type: String, enum: ["normal", "express"], required: true },
  giftOptions: {
    wrapping: { type: Boolean, default: false },
    message: { type: String, default: "" },
  },
  orderNotes: { type: String },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);