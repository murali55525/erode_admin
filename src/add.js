import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Plus, Trash2, Edit, Save, X, AlertCircle, Package, RefreshCw } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import "./add.css";

const categories = [
  "Lipstick",
  "Nail polish",
  "Soap",
  "Shampoo",
  "Perfumes",
  "Bag items",
  "Necklace",
  "Bangles",
  "Steads",
  "Hip band",
  "Bands",
  "Cosmetics makeup accessories",
  "Slippers",
  "Shoes",
  "Watches",
  "Bindi",
  "Key chains",
  "Gift items",
  "Rental jewelry",
  "Skin care products",
  "Bottles"
];

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: categories[0],
    colors: "",
    availableQuantity: "",
    description: "",
    imageFile: null,
    imagePreview: null
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [bulkAction, setBulkAction] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCategories: 0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
      
      // Calculate stats
      setStats({
        totalProducts: response.data.length,
        lowStockProducts: response.data.filter(p => p.availableQuantity < 5).length,
        totalCategories: new Set(response.data.map(p => p.category)).size
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on category and search term
    let filtered = [...products];
    
    if (selectedCategory) {
      filtered = filtered.filter(prod => prod.category === selectedCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prod => 
        prod.name.toLowerCase().includes(term) || 
        prod.description.toLowerCase().includes(term) ||
        prod.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setProduct(prev => ({ ...prev, category }));
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct({ 
          ...product, 
          imageFile: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("category", product.category);
    formData.append("colors", product.colors);
    formData.append("availableQuantity", product.availableQuantity);
    formData.append("description", product.description);
    if (product.imageFile) {
      formData.append("image", product.imageFile);
    }

    try {
      if (editId) {
        await axios.put(`http://localhost:5001/api/products/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccessMessage("Product updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        await axios.post("http://localhost:5001/api/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccessMessage("Product added successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      
      resetForm();
      fetchProducts();
    } catch (err) {
      setError("Failed to save product. Please try again.");
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProduct({
      name: "",
      price: "",
      category: categories[0],
      colors: "",
      availableQuantity: "",
      description: "",
      imageFile: null,
      imagePreview: null
    });
    setEditId(null);
    setShowAddForm(false);
  };

  const handleEdit = (prod) => {
    setProduct({
      name: prod.name,
      price: prod.price,
      category: prod.category,
      colors: prod.colors.join(", "),
      availableQuantity: prod.availableQuantity,
      description: prod.description,
      imageFile: null,
      imagePreview: prod.imageUrl
    });
    setEditId(prod._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5001/api/products/${id}`);
        setSuccessMessage("Product deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchProducts();
      } catch (err) {
        setError("Error deleting product. Please try again.");
        console.error("Error deleting product:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkAction = async () => {
    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (bulkAction === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
        try {
          setLoading(true);
          await Promise.all(selectedProducts.map(id => 
            axios.delete(`http://localhost:5001/api/products/${id}`)
          ));
          setSuccessMessage(`${selectedProducts.length} products deleted successfully!`);
          setTimeout(() => setSuccessMessage(null), 3000);
          setSelectedProducts([]);
          fetchProducts();
        } catch (err) {
          setError("Error performing bulk delete. Please try again.");
          console.error("Error performing bulk action:", err);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    let sortableProducts = [...filteredProducts];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [filteredProducts, sortConfig]);

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setSelectedProducts(sortedProducts.map(prod => prod._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const groupProductsByCategory = (products) => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  return (
    <div className="admin-product-management">
      <div className="admin-header">
        <h1>Product Management</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.lowStockProducts}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Filter size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalCategories}</h3>
              <p>Categories</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
        </div>
      )}

      <div className="admin-controls">
        <div className="admin-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        <div className="action-buttons">
          <button 
            className="btn btn-refresh" 
            onClick={fetchProducts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn btn-add" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="form-container">
          <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Product name"
                  value={product.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={product.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="colors">Colors</label>
                <input
                  id="colors"
                  type="text"
                  name="colors"
                  placeholder="Colors (comma-separated)"
                  value={product.colors}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="availableQuantity">Available Quantity</label>
                <input
                  id="availableQuantity"
                  type="number"
                  name="availableQuantity"
                  placeholder="Available Quantity"
                  value={product.availableQuantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="imageFile">Product Image</label>
                <input
                  id="imageFile"
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
              <div className="form-group description-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Product description"
                  value={product.description}
                  onChange={handleChange}
                  required
                  rows={3}
                ></textarea>
              </div>
              <div className="form-group image-preview-group">
                {product.imagePreview && (
                  <div className="image-preview">
                    <img src={product.imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="form-buttons">
              <button type="button" className="btn btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-submit" disabled={loading}>
                {loading ? "Saving..." : (editId ? 
                  <><Save size={16} /> Update Product</> : 
                  <><Plus size={16} /> Add Product</>)}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-container">
        <div className="bulk-actions">
          <div className="bulk-selection">
            <input 
              type="checkbox" 
              id="selectAll" 
              onChange={handleSelectAllProducts} 
              checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
            />
            <label htmlFor="selectAll">Select All ({selectedProducts.length}/{sortedProducts.length})</label>
          </div>
          <div className="bulk-action-controls">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button 
              className="btn btn-apply" 
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedProducts.length === 0}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="product-table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th className="select-column"></th>
                <th>Image</th>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {getSortIndicator('name')}
                </th>
                <th onClick={() => handleSort('price')} className="sortable">
                  Price {getSortIndicator('price')}
                </th>
                <th onClick={() => handleSort('category')} className="sortable">
                  Category {getSortIndicator('category')}
                </th>
                <th>Colors</th>
                <th onClick={() => handleSort('availableQuantity')} className="sortable">
                  Stock {getSortIndicator('availableQuantity')}
                </th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !sortedProducts.length ? (
                <tr>
                  <td colSpan="9" className="loading-message">Loading products...</td>
                </tr>
              ) : !sortedProducts.length ? (
                <tr>
                  <td colSpan="9" className="no-products-message">No products found</td>
                </tr>
              ) : (
                sortedProducts.map((prod) => (
                  <tr
                    key={prod._id}
                    className={`${prod.availableQuantity < 5 ? "low-quantity" : ""} ${selectedProducts.includes(prod._id) ? "selected-row" : ""}`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod._id)}
                        onChange={() => handleSelectProduct(prod._id)}
                      />
                    </td>
                    <td>
                      <img src={prod.imageUrl} alt={prod.name} className="product-image" />
                    </td>
                    <td>{prod.name}</td>
                    <td>₹{prod.price}</td>
                    <td>{prod.category}</td>
                    <td>
                      <div className="color-dots">
                        {prod.colors.map((color, index) => (
                          <span key={index} className="color-name">{color}</span>
                        ))}
                      </div>
                    </td>
                    <td className={prod.availableQuantity < 5 ? "stock-warning" : ""}>
                      {prod.availableQuantity < 5 && <AlertCircle size={14} />}
                      {prod.availableQuantity}
                    </td>
                    <td className="description-cell">
                      <div className="description-text">
                        {prod.description.length > 50 
                          ? `${prod.description.substring(0, 50)}...` 
                          : prod.description}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(prod)} className="btn-edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(prod._id)} className="btn-delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2>Products by Category</h2>
      <div className="category-groups">
        {Object.entries(groupProductsByCategory(sortedProducts)).map(([category, products]) => (
          <div key={category} className="category-group">
            <h3>{category} ({products.length})</h3>
            <div className="category-products">
              {products.map((prod) => (
                <div key={prod._id} className="product-card">
                  <div className="product-card-image">
                    <img src={prod.imageUrl} alt={prod.name} />
                    {prod.availableQuantity < 5 && (
                      <div className="low-stock-badge">
                        <AlertCircle size={14} /> Low Stock
                      </div>
                    )}
                  </div>
                  <div className="product-card-content">
                    <h4>{prod.name}</h4>
                    <p className="product-price">₹{prod.price}</p>
                    <p className="product-stock">Stock: {prod.availableQuantity}</p>
                    <div className="product-card-actions">
                      <button onClick={() => handleEdit(prod)} className="btn-card-edit">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(prod._id)} className="btn-card-delete">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductManagement;