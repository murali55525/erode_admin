import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Truck, 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  Check, 
  ArrowUpDown,
  MapPin,
  Calendar,
  Clock,
  Eye
} from 'lucide-react';
import Layout from '../components/Layout';

const BASE_URL = 'https://render-1-ehkn.onrender.com';

const ShippingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, processing, shipped, delivered
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
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
        const [ordersRes, statsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/orders`),
          axios.get(`${BASE_URL}/api/admin/data`, {
            headers: { 'Content-Type': 'application/json' }
          })
        ]);

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data.map(order => ({
            ...order,
            id: order._id,
            formattedDate: new Date(order.createdAt || order.orderDate).toLocaleDateString(),
            formattedTime: new Date(order.createdAt || order.orderDate).toLocaleTimeString(),
          })));
        }
        
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
        console.error("Error fetching shipping data:", err);
        setError(`Failed to load shipping data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // In a real implementation, you would call an API to update the status
      // await axios.put(`${BASE_URL}/api/orders/${orderId}/status`, { status: newStatus });
      
      // For now, just update the state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));

      // Update the stats count
      const updatedOrdersByStatus = { ...stats.ordersByStatus };
      // Decrement old status count
      const oldStatus = orders.find(order => order.id === orderId).status;
      if (updatedOrdersByStatus[oldStatus]) {
        updatedOrdersByStatus[oldStatus]--;
      }
      // Increment new status count
      updatedOrdersByStatus[newStatus] = (updatedOrdersByStatus[newStatus] || 0) + 1;
      
      setStats({
        ...stats,
        ordersByStatus: updatedOrdersByStatus
      });
      
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
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

  const filteredOrders = orders
    .filter(order => {
      // Apply search filter
      if (searchTerm && 
          !(
            (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.userId?.name && order.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.shippingInfo?.address && order.shippingInfo.address.toLowerCase().includes(searchTerm.toLowerCase()))
          )
      ) {
        return false;
      }
      
      // Apply status filter
      if (filter !== 'all' && order.status?.toLowerCase() !== filter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'date':
          valueA = new Date(a.createdAt || a.orderDate || 0);
          valueB = new Date(b.createdAt || b.orderDate || 0);
          break;
        case 'customer':
          valueA = a.userId?.name || '';
          valueB = b.userId?.name || '';
          break;
        case 'total':
          valueA = a.totalAmount || 0;
          valueB = b.totalAmount || 0;
          break;
        default:
          valueA = new Date(a.createdAt || a.orderDate || 0);
          valueB = new Date(b.createdAt || b.orderDate || 0);
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
          <p className="mt-4 text-lg font-medium text-gray-700">Loading shipping data...</p>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <Layout stats={stats}>
      <div className="pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shipping Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your order deliveries and shipping status.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800 border border-red-200 shadow-sm">
            <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Truck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.orderCount}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ordersByStatus?.Pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Processing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ordersByStatus?.Processing || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Truck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Shipped</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ordersByStatus?.Shipped || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Check className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ordersByStatus?.Delivered || 0}</p>
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
                placeholder="Search orders..."
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
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortBy === 'customer' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === 'date' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Shipping Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    {sortBy === 'total' && (
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {order.userId?.name || 'Unknown User'}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                          {order.formattedDate}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                          {order.formattedTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {order.shippingInfo?.address || 'No address provided'}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Contact: {order.shippingInfo?.contact || 'No contact provided'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                        value={order.status || 'Pending'}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            // You could add a printable shipping label feature here
                            alert(`Print shipping label for order ${order.id}`);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Truck className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                    No orders found. Try a different search or filter.
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

export default ShippingPage;
