const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/fancyStore")
  .then(() => console.log("Connected to MongoDB for Project 2"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error.message));

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  colors: [String],
  availableQuantity: { type: Number, default: 1 },
  description: { type: String, required: true },
  imageUrl: { type: String, default: "/images/default.jpg" }, // Added imageUrl field
});

const Product = mongoose.model("Product", productSchema);

// Add Product API
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    console.error("Error saving product:", error.message);
    res.status(500).send({ error: "Failed to save product" });
  }
});

// Get Products API
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).send({ error: "Failed to fetch products" });
  }
});

// Update Product API
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).send("Product not found");
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).send("Error updating product");
  }
});

// Delete Product API
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).send("Product not found");
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).send("Error deleting product");
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});