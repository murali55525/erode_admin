// src/pages/OrdersPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Eye, Filter, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'http://localhost:5000';

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      
      const [ordersRes, ordersStats] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/orders`, { headers }),
        axios.get(`${BASE_URL}/api/admin/orders-stats`, { headers })
      ]);

      setOrders(ordersRes.data.data.map(order => ({
        id: order._id,
        userId: order.userId?._id,
        customerName: order.userId?.name || 'Unknown',
        amount: order.totalAmount || 0,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
        items: order.items?.length || 0
      })));

      setStats({
        orderCount: ordersStats.data.data.total,
        pending: ordersStats.data.data.pending,
        delivered: ordersStats.data.data.delivered,
        totalRevenue: ordersStats.data.data.totalRevenue
      });

      setLoading(false);
    } catch (err) {
      setError(`Failed to load orders: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.post(`${BASE_URL}/api/admin/update-order`, {
        orderId,
        status
      });
      // Refresh orders after update
      fetchOrders();
    } catch (err) {
      setError(`Failed to update order: ${err.message}`);
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-bold text-gray-900">All Orders</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{order.userId}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{order.date}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{order.items}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{order.amount}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/orders/${order.id}`} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default OrdersPage;