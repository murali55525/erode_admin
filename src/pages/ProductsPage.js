// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Eye, Edit, Trash2, ArrowUpRight, Grid, List, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'https://render-1-ehkn.onrender.com'; // Update to match server port

const ProductsPage = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'all'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return `${BASE_URL}/uploads/default.jpg`;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${BASE_URL}${imageUrl}`;
    return `${BASE_URL}/uploads/products/${imageUrl}`;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const productsRes = await axios.get(`${BASE_URL}/api/products`, { headers });

      setProducts(productsRes.data);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load products: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/categories`);
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const updateProduct = async (productId, updates) => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Use the correct endpoint to update the product
      await axios.put(`${BASE_URL}/api/products/${productId}`, updates, { headers });
      
      // Refresh products after update
      fetchProducts();
      
      return true;
    } catch (err) {
      console.error("Error updating product:", err);
      setError(`Failed to update product: ${err.response?.data?.message || err.message}`);
      return false;
    }
  };
  
  // Add a function to update stock or any specific product field
  const updateProductStock = async (productId, newStock) => {
    return updateProduct(productId, { stock: newStock });
  };
  
  // Add function to update product availability (for quick toggles)
  const toggleProductAvailability = async (productId, currentStock) => {
    // If stock is 0, set it to a default value (10), otherwise set to 0
    const newStock = currentStock === 0 ? 10 : 0;
    return updateProduct(productId, { stock: newStock });
  };

  // Add a function to quickly increase/decrease product stock
  const quickUpdateStock = async (productId, stockDelta) => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return false;
      
      const newStock = Math.max(0, (product.stock || 0) + stockDelta);
      const success = await updateProduct(productId, { stock: newStock });
      
      if (success) {
        // Update local state
        setProducts(products.map(p => 
          p._id === productId ? {...p, stock: newStock} : p
        ));
      }
      
      return success;
    } catch (err) {
      console.error("Error updating stock:", err);
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${BASE_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(products.filter((product) => product._id !== id));
      } catch (err) {
        setError(`Failed to delete product: ${err.message}`);
      }
    }
  };

  const getProductsByCategory = (categoryName) => {
    return products.filter(product => product.category === categoryName);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Layout stats={stats}>
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800">
          <span>{error}</span>
        </div>
      )}
      
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('category')}
              className={`p-2 rounded-md ${viewMode === 'category' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`p-2 rounded-md ${viewMode === 'all' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          {viewMode === 'category' && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 rounded-md bg-white px-3 py-2 text-sm border"
              >
                <span>Category: {selectedCategory === 'all' ? 'All' : selectedCategory}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category._id}
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <Link to="/products/add" className="flex items-center space-x-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
            <Package className="h-5 w-5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {viewMode === 'category' ? (
        <div className="grid gap-6 mb-6">
          {(selectedCategory === 'all' ? categories : categories.filter(c => c.name === selectedCategory)).map(category => (
            <div key={category._id} className="bg-white rounded-lg shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getProductsByCategory(category.name).map(product => (
                    <ProductCard key={product._id} product={product} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12">
                      <img 
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${BASE_URL}/uploads/default.jpg`;
                        }}
                        loading="lazy"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">₹{product.price}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => quickUpdateStock(product._id, -1)}
                        className="h-5 w-5 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >-</button>
                      
                      <span className={product.stock < 10 ? 'text-red-600' : 'text-gray-700'}>
                        {product.stock}
                      </span>
                      
                      <button 
                        onClick={() => quickUpdateStock(product._id, 1)}
                        className="h-5 w-5 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 flex space-x-2">
                    <Link to={`/products/${product._id}`} className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link to={`/products/edit/${product._id}`} className="text-green-600 hover:text-green-800">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

const ProductCard = ({ product, onDelete }) => (
  <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
    <div className="relative h-48">
      <img 
        src={product.imageId ? `${BASE_URL}/api/images/${product.imageId}` : '/placeholder-product.png'}
        alt={product.name}
        className="h-full w-full object-cover rounded-t-lg"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-product.png';
        }}
        loading="lazy"
      />
    </div>
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{product.category}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
        <span className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
          Stock: {product.stock}
        </span>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        <Link to={`/products/${product._id}`} className="text-blue-600 hover:text-blue-800">
          <Eye className="h-5 w-5" />
        </Link>
        <Link to={`/products/edit/${product._id}`} className="text-green-600 hover:text-green-800">
          <Edit className="h-5 w-5" />
        </Link>
        <button onClick={() => onDelete(product._id)} className="text-red-600 hover:text-red-800">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);

export default ProductsPage;