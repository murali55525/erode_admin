const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const dotenv = require("dotenv");

dotenv.config();
// Middleware
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
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