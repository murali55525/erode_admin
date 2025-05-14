// src/pages/DiscountsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  Percent,
  Search,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'https://render-1-ehkn.onrender.com';

const DiscountsPage = () => {
  const { token } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = { 'Content-Type': 'application/json' };
        const response = await axios.get(`${BASE_URL}/api/discounts`, { headers });
        
        setDiscounts(response.data);
        setFilteredDiscounts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching discounts:", err);
        setError(`Failed to load discounts: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setFilteredDiscounts(discounts);
      return;
    }

    const filtered = discounts.filter(discount =>
      discount.name.toLowerCase().includes(value.toLowerCase()) ||
      discount.code.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDiscounts(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleEditDiscount = (discount) => {
    // Logic to handle discount editing
    console.log("Edit discount:", discount);
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      try {
        await axios.delete(`${BASE_URL}/api/discounts/${id}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        setDiscounts(discounts.filter(discount => discount.id !== id));
        setFilteredDiscounts(filteredDiscounts.filter(discount => discount.id !== id));
      } catch (err) {
        console.error("Error deleting discount:", err);
        setError(`Failed to delete discount: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md">
          <div className="h-14 w-14 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading discounts data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the discount information</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800 border border-red-200 shadow-sm">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      <div className="mb-8 rounded-xl bg-white shadow-md">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center">
            <Percent className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Manage Discounts</h2>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/discounts/create"
              className="flex items-center space-x-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors duration-200"
            >
              <span>Create Discount</span>
            </Link>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by discount name or code"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-500 focus:border-purple-500 focus:ring focus:ring-purple-200"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Discount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredDiscounts.length > 0 ? (
                  filteredDiscounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-purple-50 text-purple-600 mr-3">
                            <Percent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                            <div className="text-xs text-gray-500">
                              {discount.applicableProducts === 'all' 
                                ? 'All Products' 
                                : discount.applicableProducts === 'selected' 
                                  ? 'Selected Products' 
                                  : 'Selected Categories'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 border border-purple-200">
                          {discount.code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {discount.type === 'percentage' 
                            ? `${discount.value}%` 
                            : `₹${discount.value}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {discount.minPurchase > 0 && `Min: ₹${discount.minPurchase}`}
                          {discount.minPurchase > 0 && discount.maxDiscount > 0 && ' • '}
                          {discount.maxDiscount > 0 && `Max: ₹${discount.maxDiscount}`}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(discount.startDate).toLocaleDateString()} to {new Date(discount.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(discount.status)}`}>
                          {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {discount.usageCount} / {discount.usageLimit > 0 ? discount.usageLimit : '∞'}
                        </div>
                        {discount.usageLimit > 0 && (
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-1.5 bg-purple-600 rounded-full" 
                              style={{ width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDiscount(discount)}
                            className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 hover:text-purple-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                      No discounts found. Try a different search or filter, or create a new discount.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiscountsPage;