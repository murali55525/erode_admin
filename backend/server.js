const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve images statically

// Ensure "uploads" directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/fancyStore", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect:", error.message));

// Configure Multer for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  colors: [String],
  availableQuantity: { type: Number, default: 1 },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Store the path, not binary
  dateAdded: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

// Add Product API (with image upload)
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, rating, colors, availableQuantity, description } = req.body;
    const imageUrl = req.file ? `http://localhost:5001/uploads/${req.file.filename}` : "http://localhost:5001/uploads/default.jpg";

    const product = new Product({
      name,
      price,
      category,
      rating,
      colors: colors ? colors.split(",") : [],
      availableQuantity,
      description,
      imageUrl,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully!", product });
  } catch (error) {
    console.error("Error saving product:", error.message);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Get Products API
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Delete Product API
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
