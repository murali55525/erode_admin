import React, { useState, useEffect } from "react";
import axios from "axios";
import "./add.css";

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    colors: "",
    availableQuantity: "",
    description: "",
    imageFile: null,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch products from the backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/products");
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, imageFile: file });
    }
  };

  // Add or update product
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
        // Update product
        await axios.put(`http://localhost:5001/api/products/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Product updated successfully!");
      } else {
        // Add product
        await axios.post("http://localhost:5001/api/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Product added successfully!");

  window.location.reload();
      }
      setProduct({
        name: "",
        price: "",
        category: "",
        colors: "",
        availableQuantity: "",
        description: "",
        imageFile: null,
      });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      setError("Failed to save product. Please try again.");
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Set product data for editing
  const handleEdit = (product) => {
    setProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      colors: product.colors.join(", "),
      availableQuantity: product.availableQuantity,
      description: product.description,
      imageFile: null,
    });
    setEditId(product._id);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5001/api/products/${id}`);
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <div className="admin-product-management">
      <h1>Product Management</h1>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={product.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={product.category}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="colors"
          placeholder="Colors (comma-separated)"
          value={product.colors}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="availableQuantity"
          placeholder="Available Quantity"
          value={product.availableQuantity}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="imageFile"
          accept="image/*"
          onChange={handleImageChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          required
        ></textarea>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h2>Product List</h2>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Colors</th>
            <th>Quantity</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod._id}>
              <td>
                <img src={prod.imageUrl} alt={prod.name} className="product-image" />
              </td>
              <td>{prod.name}</td>
              <td>{prod.price}</td>
              <td>{prod.category}</td>
              <td>{prod.colors.join(", ")}</td>
              <td>{prod.availableQuantity}</td>
              <td>{prod.description}</td>
              <td>
                <button onClick={() => handleEdit(prod)}>Edit</button>
                <button onClick={() => handleDelete(prod._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductManagement;