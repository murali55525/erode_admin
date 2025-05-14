import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit, 
  Plus, 
  ArrowUpDown,
  Eye,
  RefreshCcw
} from 'lucide-react';
import Layout from '../components/Layout';

const BASE_URL = 'https://render-1-ehkn.onrender.com';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    userCount: 0,
    orderCount: 0,
    productCount: 0,
    revenue: 0,
    lowStock: 0,
    activeUsers: 0,
    ordersByStatus: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, statsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/products`),
          axios.get(`${BASE_URL}/api/admin/data`, {
            headers: { 'Content-Type': 'application/json' }
          })
        ]);

        setProducts(productsRes.data.map(product => ({
          ...product,
          id: product._id,
          stockStatus: getStockStatus(product.stock)
        })));
        
        const adminData = statsRes.data.data;
        setStats({
          userCount: adminData.counts?.users || 0,
          orderCount: adminData.counts?.orders || 0,
          productCount: adminData.counts?.products || 0,
          revenue: adminData.counts?.revenue || 0,
          lowStock: adminData.stats?.lowStock || 0,
          activeUsers: adminData.stats?.activeUsers || 0,
          ordersByStatus: adminData.stats?.ordersByStatus || {}
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError(`Failed to load inventory data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStockStatus = (stock) => {
    if (stock <= 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await axios.put(`${BASE_URL}/api/products/${productId}`, { stock: newStock });
      
      setProducts(products.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              stock: newStock,
              stockStatus: getStockStatus(newStock)
            } 
          : product
      ));
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('asc');
    }
  };

  const filteredProducts = products
    .filter(product => {
      // Apply search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply stock status filter
      if (filter === 'low-stock' && product.stockStatus !== 'low-stock') {
        return false;
      }
      if (filter === 'out-of-stock' && product.stockStatus !== 'out-of-stock') {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'stock':
          valueA = a.stock;
          valueB = b.stock;
          break;
        case 'category':
          valueA = a.category;
          valueB = b.category;
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <Layout stats={stats}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading inventory data...</p>
        </div>
      </Layout>
    );
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'in-stock':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <Layout stats={stats}>
      <div className="pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your product stock levels and inventory status.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800 border border-red-200 shadow-sm">
            <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.productCount}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stock <= 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <RefreshCcw className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Healthy Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.stock >= 10).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/products/add"
              className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product Name
                    {sortBy === 'name' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === 'category' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortBy === 'price' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center">
                    Stock
                    {sortBy === 'stock' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.imageUrl ? `${BASE_URL}${product.imageUrl}` : '/api/placeholder/100/100'}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "/api/placeholder/100/100";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
                          value={product.stock}
                          onChange={(e) => {
                            const newStock = parseInt(e.target.value, 10);
                            setProducts(
                              products.map((p) =>
                                p.id === product.id ? { ...p, stock: newStock } : p
                              )
                            );
                          }}
                        />
                        <button
                          className="rounded-md bg-purple-100 p-1 text-purple-600 hover:bg-purple-200"
                          onClick={() => handleUpdateStock(product.id, product.stock)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStockStatusColor(
                          product.stockStatus
                        )}`}
                      >
                        {product.stockStatus === 'in-stock'
                          ? 'In Stock'
                          : product.stockStatus === 'low-stock'
                          ? 'Low Stock'
                          : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    No products found. Try a different search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default InventoryPage;
