const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
}));

// Add variable for gfs
let gfs;

// Update MongoDB Connection with GridFS initialization
mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://your_username:your_password@cluster0.mongodb.net/erodefancy", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    // Initialize GridFS
    gfs = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads"
    });
    console.log("✅ GridFS initialized");
  })
  .catch((error) => {
    console.error("❌ MongoDB Atlas connection error:", error.message);
  });

// Configure Multer for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
    }
  },
});

// Multer Error Handling Middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: "File upload error: " + error.message });
  }
  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// General Error Handling Middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);
  res.status(500).json({ error: "Internal server error: " + error.message });
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  imageId: { type: mongoose.Types.ObjectId, required: false }, // GridFS file ID
  dateAdded: { type: Date, default: Date.now },
});
const Category = mongoose.model("Category", categorySchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
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
const Product = mongoose.model("Product", productSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "client"], default: "client" },
});
const User = mongoose.model("User", userSchema);

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
    console.log("Product categories added to the database:", categoriesToAdd.length);
  } catch (error) {
    console.error("Error populating categories:", error.message);
  }
};

// Helper function to upload image to GridFS
const uploadImageToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const writeStream = gfs.openUploadStream(file.originalname, {
      contentType: file.mimetype,
    });
    writeStream.write(file.buffer);
    writeStream.end();
    writeStream.on("finish", () => resolve(writeStream.id));
    writeStream.on("error", (error) => reject(error));
  });
};

// Routes

// Add Category API
app.post("/api/categories", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Category name is required." });

    let imageId = null;
    if (req.file) {
      imageId = await uploadImageToGridFS(req.file);
    }

    const category = new Category({ name: name.trim(), imageId });
    await category.save();

    res.status(201).json({
      message: "Category added successfully!",
      category: { ...category._doc, _id: category._id },
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
    res.status(200).json(categories);
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
    res.status(200).json(category);
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
    let imageId = (await Category.findById(id))?.imageId;

    if (req.file) {
      // Delete old image from GridFS if it exists
      if (imageId) {
        await gfs.delete(new mongoose.Types.ObjectId(imageId));
      }
      imageId = await uploadImageToGridFS(req.file);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name: name ? name.trim() : undefined, imageId },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) return res.status(404).json({ error: "Category not found" });

    res.status(200).json({
      message: "Category updated successfully!",
      category: { ...updatedCategory._doc, _id: updatedCategory._id },
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

    if (deletedCategory.imageId) {
      await gfs.delete(new mongoose.Types.ObjectId(deletedCategory.imageId));
    }

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ error: "Failed to delete category: " + error.message });
  }
});

// Add Product API
app.post("/api/admin/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    
    let imageId = null;
    if (req.file) {
      imageId = await uploadImageToGridFS(req.file);
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      category,
      description,
      stock: parseInt(stock),
      imageId
    });

    await product.save();
    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product
    });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Get Products API
app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ dateAdded: -1 });
    
    // Transform products to include image URLs
    const productsWithUrls = products.map(product => ({
      ...product._doc,
      imageUrl: product.imageId ? `/api/images/${product.imageId}` : null
    }));

    res.status(200).json({
      success: true,
      data: productsWithUrls
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get Product by ID API
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product: " + error.message });
  }
});

// Update Product API
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, rating, colors, availableQuantity, stock, sold, description, offerEnds } = req.body;
    let imageId = (await Product.findById(id))?.imageId;

    if (req.file) {
      // Delete old image from GridFS if it exists
      if (imageId) {
        await gfs.delete(new mongoose.Types.ObjectId(imageId));
      }
      imageId = await uploadImageToGridFS(req.file);
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
        imageId,
        offerEnds: offerEnds ? new Date(offerEnds) : undefined,
      },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({
      message: "Product updated successfully!",
      product: { ...updatedProduct._doc, _id: updatedProduct._id },
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

    if (deletedProduct.imageId) {
      await gfs.delete(new mongoose.Types.ObjectId(deletedProduct.imageId));
    }

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product: " + error.message });
  }
});

// Lens Search API (Placeholder - Update as Needed)
app.post("/api/products/lens-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required." });

    // Placeholder: Implement actual lens search logic
    const matchedProducts = await Product.find().limit(5);
    res.status(200).json(matchedProducts);
  } catch (error) {
    console.error("Error in lens search:", error.message);
    res.status(500).json({ message: "Failed to process lens search: " + error.message });
  }
});

// Update Get Image API
app.get("/api/images/:id", async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).json({ error: "GridFS not initialized" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfs.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType);
    
    const readStream = gfs.openDownloadStream(fileId);
    readStream.pipe(res);

    readStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ error: "Error streaming file" });
    });
  } catch (error) {
    console.error("Error fetching image:", error.message);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});
app.put("/api/admin/orders/:orderId/status", async (req, res) => {
  // WARNING: This endpoint is publicly accessible without authentication.
  // In production, secure it with an API key, IP whitelisting, or other access control.
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!["Pending", "Processing", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: {
        _id: order._id,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Error updating order status (Port 5001):", error.stack);
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
});

// Cancel Order (Unauthenticated)
app.put("/api/admin/orders/:orderId/cancel", async (req, res) => {
  // WARNING: This endpoint is publicly accessible without authentication.
  // In production, secure it with an API key, IP whitelisting, or other access control.
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order: {
        _id: order._id,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Error cancelling order (Port 5001):", error.stack);
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
});

// Generate Invoice (Unauthenticated)
app.get("/api/admin/orders/:orderId/invoice", async (req, res) => {
  // WARNING: This endpoint is publicly accessible without authentication.
  // In production, secure it with an API key, IP whitelisting, or other access control.
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId).populate("userId", "name email phone");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{booktabs}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{palatino}
\\title{Invoice}
\\author{}
\\date{\\today}
\\begin{document}
\\maketitle
\\section*{Invoice}
\\textbf{Order ID:} ${order._id}\\\\
\\textbf{Customer:} ${order.userId?.name || 'Unknown'} \\\\
\\textbf{Email:} ${order.userId?.email || 'N/A'} \\\\
\\textbf{Phone:} ${order.userId?.phone || 'N/A'} \\\\
\\textbf{Order Date:} ${new Date(order.createdAt).toLocaleDateString()} \\\\
\\textbf{Status:} ${order.status} \\\\
\\textbf{Shipping Address:} ${order.shippingInfo?.address || 'N/A'} \\\\
\\vspace{0.5cm}
\\begin{table}[h!]
\\centering
\\begin{tabular}{llrr}
\\toprule
\\textbf{Item} & \\textbf{Color} & \\textbf{Quantity} & \\textbf{Price (₹)} \\\\
\\midrule
${order.items
  .map(
    (item) => `${item.name || 'Unknown'} & ${item.color || 'N/A'} & ${item.quantity || 0} & ${item.price?.toFixed(2) || '0.00'} \\\\`
  )
  .join('')}
\\bottomrule
\\end{tabular}
\\end{table}
\\vspace{0.5cm}
\\textbf{Total Amount:} ₹${order.totalAmount?.toFixed(2) || '0.00'} \\\\
\\end{document}
`;

    res.setHeader('Content-Type', 'text/latex');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.tex`);
    res.status(200).send(latexContent);
  } catch (error) {
    console.error("Error generating invoice (Port 5001):", error.stack);
    res.status(500).json({ message: "Failed to generate invoice", error: error.message });
  }
});
// Register User API (Optional - For creating users)
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "client",
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Failed to register user: " + error.message });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Server error during login: " + error.message });
  }
});

// Update Product API Routes
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ dateAdded: -1 });
    res.status(200).json(products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock,
      imageId: product.imageId,
      imageUrl: product.imageId ? `/api/images/${product.imageId}` : null
    })));
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    
    let imageId = null;
    if (req.file) {
      imageId = await uploadImageToGridFS(req.file);
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      category,
      description,
      stock: parseInt(stock),
      imageId
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully!",
      product: {
        ...product._doc,
        imageUrl: imageId ? `/api/images/${imageId}` : null
      }
    });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));