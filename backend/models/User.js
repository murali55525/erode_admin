// models/User.js (Admin backend, port 5001)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
});

module.exports = mongoose.model("User", userSchema);