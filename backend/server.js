const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure "uploads" directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

require("dotenv").config(); // add this as line 1

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    populateCategories();
  })
  .catch((error) => {
    console.error("❌ MongoDB Atlas connection error:", error.message);
    process.exit(1);
  });


// Configure Multer for Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  imageUrl: { type: String, required: false },
  dateAdded: { type: Date, default: Date.now },
});
const Category = mongoose.model("Category", categorySchema);

// Product Schema (Updated)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true }, // Flexible string for Home/Shop
  rating: { type: Number, default: 0, min: 0, max: 5 },
  colors: [String],
  availableQuantity: { type: Number, default: 0, min: 0 }, // Shop-specific
  stock: { type: Number, default: 0, min: 0 }, // Home-specific
  sold: { type: Number, default: 0, min: 0 }, // Home-specific
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: false },
  offerEnds: { type: Date },
  dateAdded: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", productSchema);

// Populate Categories
const populateCategories = async () => {
  try {
    await Category.deleteMany({});
    console.log("Cleared existing categories.");

    const categoriesToAdd = [
      { name: "Lipstick" }, { name: "Nail Polish" }, { name: "Soap" }, { name: "Shampoo" },
      { name: "Perfumes" }, { name: "Bag Items" }, { name: "Necklace" }, { name: "Bangles" },
      { name: "Steads" }, { name: "Hip Band" }, { name: "Bands" }, { name: "Cosmetics Makeup Accessories" },
      { name: "Slippers" }, { name: "Shoes" }, { name: "Watches" }, { name: "Bindi" },
      { name: "Key Chains" }, { name: "Gift Items" }, { name: "Rental Jewelry" }, { name: "Skin Care Products" },
      { name: "Bottles" }, { name: "featuredProducts" }, { name: "trendingProducts" }, { name: "dealOfTheDay" },
      { name: "shop" },
    ];

    await Category.insertMany(categoriesToAdd);
    console.log("Product categories added to the database:", categoriesToAdd);
  } catch (error) {
    console.error("Error populating categories:", error.message);
  }
};

// Routes

// Add Category API
app.post("/api/categories", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Category name is required." });

    const imageUrl = req.file ? `uploads/${req.file.filename}` : "";
    const category = new Category({ name: name.trim(), imageUrl });
    await category.save();

    res.status(201).json({
      message: "Category added successfully!",
      category: { ...category._doc, imageUrl: imageUrl ? `http://localhost:5001/${imageUrl}` : "", _id: category._id },
    });
  } catch (error) {
    console.error("Error saving category:", error.message);
    if (error.code === 11000) {
      res.status(400).json({ error: "Category name already exists." });
    } else {
      res.status(500).json({ error: "Failed to save category: " + error.message });
    }
  }
});

// Get Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ dateAdded: -1 });
    const categoriesWithFullUrls = categories.map((category) => ({
      ...category._doc,
      imageUrl: category.imageUrl ? `http://localhost:5001/${category.imageUrl}` : "",
      _id: category._id,
    }));
    res.status(200).json(categoriesWithFullUrls);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: "Failed to fetch categories: " + error.message });
  }
});

// Get Category by ID API
app.get("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({
      ...category._doc,
      imageUrl: category.imageUrl ? `http://localhost:5001/${category.imageUrl}` : "",
      _id: category._id,
    });
  } catch (error) {
    console.error("Error fetching category:", error.message);
    res.status(500).json({ error: "Failed to fetch category: " + error.message });
  }
});

// Update Category API
app.put("/api/categories/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let imageUrl = req.body.imageUrl || (await Category.findById(id))?.imageUrl || "";

    if (req.file) {
      const oldCategory = await Category.findById(id);
      if (oldCategory?.imageUrl) {
        const oldFilename = oldCategory.imageUrl.split("uploads/")[1];
        fs.unlink(path.join(__dirname, "uploads", oldFilename), (err) => {
          if (err) console.error("Failed to delete old category image:", err.message);
        });
      }
      imageUrl = `uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name: name ? name.trim() : undefined, imageUrl },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) return res.status(404).json({ error: "Category not found" });

    res.status(200).json({
      message: "Category updated successfully!",
      category: { ...updatedCategory._doc, imageUrl: imageUrl ? `http://localhost:5001/${imageUrl}` : "", _id: updatedCategory._id },
    });
  } catch (error) {
    console.error("Error updating category:", error.message);
    if (error.code === 11000) {
      res.status(400).json({ error: "Category name already exists." });
    } else {
      res.status(500).json({ error: "Failed to update category: " + error.message });
    }
  }
});

// Delete Category API
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ error: "Category not found" });

    if (deletedCategory.imageUrl) {
      const filename = deletedCategory.imageUrl.split("uploads/")[1];
      fs.unlink(path.join(__dirname, "uploads", filename), (err) => {
        if (err) console.error("Failed to delete category image file:", err.message);
      });
    }

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ error: "Failed to delete category: " + error.message });
  }
});

// Add Product API (Updated)
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, rating, colors, availableQuantity, stock, sold, description, offerEnds } = req.body;
    if (!name?.trim() || !price || !category || !description?.trim()) {
      return res.status(400).json({ error: "Name, price, category, and description are required." });
    }

    const imageUrl = req.file ? `uploads/${req.file.filename}` : req.body.imageUrl || "";
    const product = new Product({
      name: name.trim(),
      price: parseFloat(price),
      category,
      rating: parseInt(rating) || 0,
      colors: colors ? colors.split(",").map((color) => color.trim()) : [],
      availableQuantity: parseInt(availableQuantity) || parseInt(stock) || 0,
      stock: parseInt(stock) || parseInt(availableQuantity) || 0,
      sold: parseInt(sold) || 0,
      description: description.trim(),
      imageUrl,
      offerEnds: offerEnds ? new Date(offerEnds) : undefined,
    });

    await product.save();
    res.status(201).json({
      message: "Product added successfully!",
      product: { ...product._doc, imageUrl: imageUrl ? `http://localhost:5001/${imageUrl}` : "", _id: product._id },
    });
  } catch (error) {
    console.error("Error saving product:", error.message);
    res.status(500).json({ error: "Failed to save product: " + error.message });
  }
});

// Get Products API
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ dateAdded: -1 });
    const productsWithFullUrls = products.map((product) => ({
      ...product._doc,
      imageUrl: product.imageUrl ? `http://localhost:5001/${product.imageUrl}` : "",
      _id: product._id,
    }));
    res.status(200).json(productsWithFullUrls);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products: " + error.message });
  }
});

// Get Product by ID API
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({
      ...product._doc,
      imageUrl: product.imageUrl ? `http://localhost:5001/${product.imageUrl}` : "",
      _id: product._id,
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product: " + error.message });
  }
});

// Update Product API (Updated)
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, rating, colors, availableQuantity, stock, sold, description, offerEnds } = req.body;
    let imageUrl = req.body.imageUrl || (await Product.findById(id))?.imageUrl || "";

    if (req.file) {
      const oldProduct = await Product.findById(id);
      if (oldProduct?.imageUrl) {
        const oldFilename = oldProduct.imageUrl.split("uploads/")[1];
        fs.unlink(path.join(__dirname, "uploads", oldFilename), (err) => {
          if (err) console.error("Failed to delete old image:", err.message);
        });
      }
      imageUrl = `uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name ? name.trim() : undefined,
        price: price ? parseFloat(price) : undefined,
        category,
        rating: rating ? parseInt(rating) : undefined,
        colors: colors ? colors.split(",").map((color) => color.trim()) : undefined,
        availableQuantity: availableQuantity ? parseInt(availableQuantity) : stock ? parseInt(stock) : undefined,
        stock: stock ? parseInt(stock) : availableQuantity ? parseInt(availableQuantity) : undefined,
        sold: sold ? parseInt(sold) : undefined,
        description: description ? description.trim() : undefined,
        imageUrl,
        offerEnds: offerEnds ? new Date(offerEnds) : undefined,
      },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({
      message: "Product updated successfully!",
      product: { ...updatedProduct._doc, imageUrl: imageUrl ? `http://localhost:5001/${imageUrl}` : "", _id: updatedProduct._id },
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "Failed to update product: " + error.message });
  }
});

// Delete Product API
app.delete("/api/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    if (deletedProduct.imageUrl) {
      const filename = deletedProduct.imageUrl.split("uploads/")[1];
      fs.unlink(path.join(__dirname, "uploads", filename), (err) => {
        if (err) console.error("Failed to delete image file:", err.message);
      });
    }

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product: " + error.message });
  }
});

// Lens Search API (Unchanged)
app.post("/api/products/lens-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required." });
    const imagePath = req.file.path;

    const matchedProducts = await Product.find().limit(5);
    const productsWithFullUrls = matchedProducts.map((product) => ({
      ...product._doc,
      imageUrl: product.imageUrl ? `http://localhost:5001/${product.imageUrl}` : "",
      _id: product._id,
    }));

    fs.unlink(imagePath, (err) => {
      if (err) console.error("Failed to delete temp image:", err);
    });

    res.status(200).json(productsWithFullUrls);
  } catch (error) {
    console.error("Error in lens search:", error.stack);
    res.status(500).json({ message: "Failed to process lens search.", error: error.message });
  }
});

// Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));