// src/pages/AddProductPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'http://localhost:5000'; // Update to match server port

const AddProductPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/categories`);
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Append all form data except image
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Handle image upload
      if (image) {
        formDataToSend.append('image', image); // Changed from 'productImage' to 'image' to match server
      }

      const response = await axios.post(
        `${BASE_URL}/api/products`,
        formDataToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.message === "Product added successfully!") {
        navigate('/products');
      } else {
        throw new Error(response.data.error || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG and GIF files are allowed');
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null); // Clear any existing errors
    }
  };

  return (
    <Layout stats={stats}>
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the information below to add a new product to your store.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Stock */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="relative max-w-[200px] mx-auto">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Package className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md bg-white font-medium text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 hover:text-purple-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </>
                      )}
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 flex items-center ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default AddProductPage;