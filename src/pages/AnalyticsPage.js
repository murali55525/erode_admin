// src/pages/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


import Layout from '../components/Layout';

const BASE_URL = 'http://localhost:5000';

const AnalyticsPage = () => {
  const { token } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const headers = { 'Content-Type': 'application/json' };
        
        // Fetch orders data
        const ordersRes = await axios.get(`${BASE_URL}/api/admin/orders`, { headers });
        const orders = ordersRes.data.data || [];

        // Process orders to create sales data
        const salesByMonth = orders.reduce((acc, order) => {
          const date = new Date(order.createdAt);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          
          if (!acc[monthYear]) {
            acc[monthYear] = {
              month: monthYear,
              sales: 0,
              orders: 0
            };
          }
          
          acc[monthYear].sales += order.totalAmount || 0;
          acc[monthYear].orders += 1;
          
          return acc;
        }, {});

        // Convert to array and sort by date
        const salesData = Object.values(salesByMonth).sort((a, b) => {
          const [aMonth, aYear] = a.month.split('/');
          const [bMonth, bYear] = b.month.split('/');
          return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
        });

        setSalesData(salesData);

        // Update stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const ordersByStatus = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          orderCount: orders.length,
          ordersByStatus,
          totalRevenue,
          averageOrderValue: orders.length ? totalRevenue / orders.length : 0
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(`Failed to load analytics: ${err.message}`);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h2>
          <BarChart width={500} height={300} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="sales" name="Sales (₹)" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h2>
          <LineChart width={500} height={300} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" name="Number of Orders" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
      {/* Add summary statistics */}
      <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            ₹{stats.averageOrderValue?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            ₹{stats.totalRevenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
          <div className="mt-1 space-y-1">
            {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="capitalize">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;