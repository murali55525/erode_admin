// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add other fields as needed (e.g., profilePic, role, etc.)
});

module.exports = mongoose.model("User", userSchema);