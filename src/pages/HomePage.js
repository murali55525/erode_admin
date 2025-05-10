// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Filter,
  Eye,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Mail,
  Lock,
  User,
  Bell,
  Shield,
  Bookmark,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'http://localhost:5000';

const HomePage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    orderCount: 0,
    productCount: 0,
    revenue: 0,
    lowStock: 0,
    activeUsers: 0,
    ordersByStatus: {},
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = { 'Content-Type': 'application/json' };
        
        const [adminData, overviewData] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/data`, { headers }),
          axios.get(`${BASE_URL}/api/admin/overview`, { headers })
        ]);

        // Add null checks and default values
        setStats({
          userCount: adminData.data.data.counts?.users || 0,
          orderCount: adminData.data.data.counts?.orders || 0,
          productCount: adminData.data.data.counts?.products || 0,
          revenue: adminData.data.data.counts?.revenue || 0,
          lowStock: adminData.data.data.stats?.lowStock || 0,
          activeUsers: adminData.data.data.stats?.activeUsers || 0,
          ordersByStatus: adminData.data.data.stats?.ordersByStatus || {}
        });

        // Update recent orders with null checks
        const orders = adminData.data.data.recent?.orders || [];
        setRecentOrders(orders.map(order => ({
          id: order._id || '',
          userId: order.userId?._id || 'Unknown',
          customerName: order.userId?.name || 'Unknown',
          amount: order.totalAmount || 0,
          status: order.status || 'Pending',
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          items: order.items?.length || 0
        })));

        // Update recent products with null checks
        const products = adminData.data.data.recent?.products || [];
        setRecentProducts(products.map(product => ({
          id: product._id || '',
          name: product.name || '',
          price: product.price || 0,
          category: product.category || 'Uncategorized',
          stock: product.stock || 0,
          imageUrl: product.imageUrl || ''
        })));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md">
          <div className="h-14 w-14 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your store's information</p>
        </div>
      </div>
    );
  }

  // Update settingsSections to include navigation
  const settingsSections = [
    {
      title: 'General Settings',
      icon: <Settings className="h-5 w-5 text-purple-600" />,
      items: [
        { 
          name: 'Profile Information', 
          description: 'Update your admin account details', 
          icon: <User />,
          path: '/settings?tab=general'
        },
        { 
          name: 'Email Notifications', 
          description: 'Manage your email preferences', 
          icon: <Mail />,
          path: '/settings?tab=notifications'
        },
        { 
          name: 'Security Settings', 
          description: 'Update password and security options', 
          icon: <Lock />,
          path: '/settings?tab=security'
        }
      ]
    },
    {
      title: 'Store Settings',
      icon: <Bookmark className="h-5 w-5 text-purple-600" />,
      items: [
        { name: 'Store Information', description: 'Manage store details and policies', icon: <Shield />, path: '/settings?tab=store' },
        { name: 'Notification Settings', description: 'Configure alert preferences', icon: <Bell />, path: '/settings?tab=alerts' }
      ]
    }
  ];

  // Get current date for welcome message
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <Layout stats={stats}>
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800 border border-red-200 shadow-sm">
          <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Admin</h1>
            <div className="flex items-center mt-2 text-purple-100">
              <Calendar className="mr-2 h-4 w-4" />
              <p>{currentDate}</p>
            </div>
            <p className="mt-2 text-purple-100">Here's what's happening with your store today.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="Total Users"
          value={stats.userCount.toLocaleString()}
          subtitle={`${stats.activeUsers} active users`}
          bgColor="bg-blue-100"
          trend="+12.5%"
          trendUp={true}
        />
        <StatsCard
          icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
          title="Total Orders"
          value={stats.orderCount.toLocaleString()}
          subtitle={`${stats.ordersByStatus?.Pending || 0} pending`}
          bgColor="bg-green-100"
          trend="+8.2%"
          trendUp={true}
        />
        <StatsCard
          icon={<Package className="h-6 w-6 text-purple-600" />}
          title="Total Products"
          value={stats.productCount.toLocaleString()}
          subtitle={`${stats.lowStock} low stock`}
          bgColor="bg-purple-100"
          trend="+5.1%"
          trendUp={true}
        />
        <StatsCard
          icon={<DollarSign className="h-6 w-6 text-yellow-600" />}
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          subtitle={`${stats.ordersByStatus?.Delivered || 0} delivered`}
          bgColor="bg-yellow-100"
          trend="+15.3%"
          trendUp={true}
        />
      </div>
      
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-md">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>
            <Link
              to="/orders"
              className="flex items-center space-x-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors duration-200"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="whitespace-nowrap px-4 py-4">Order ID</th>
                <th className="whitespace-nowrap px-4 py-4">User ID</th>
                <th className="whitespace-nowrap px-4 py-4">Date</th>
                <th className="whitespace-nowrap px-4 py-4">Items</th>
                <th className="whitespace-nowrap px-4 py-4">Amount</th>
                <th className="whitespace-nowrap px-4 py-4">Status</th>
                <th className="whitespace-nowrap px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">{order.userId}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        {order.date}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700">
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                        {order.items} items
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-900">₹{order.amount.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8 rounded-xl bg-white shadow-md overflow-hidden">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
          </div>
          <Link
            to="/products"
            className="flex items-center space-x-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors duration-200"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-6 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {recentProducts.length > 0 ? (
            recentProducts.map((product) => (
              <div key={product.id} className="group rounded-xl border border-gray-200 p-3 transition-all hover:border-purple-300 hover:shadow-md">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={product.imageUrl ? `${BASE_URL}/${product.imageUrl}` : "/api/placeholder/200/150"}
                    alt={product.name}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/200/150";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all group-hover:bg-opacity-40 group-hover:opacity-100">
                    <Link
                      to={`/products/${product.id}`}
                      className="rounded-full bg-white p-2 text-gray-800 hover:bg-purple-100 transform transition-transform duration-300 hover:scale-110"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 border border-purple-200">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock < 10 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-sm text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="mt-8 mb-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-bold text-gray-900">Admin Settings</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {settingsSections.map((section, idx) => (
            <div key={idx} className="rounded-xl bg-white p-6 shadow-md border border-gray-100 hover:border-purple-200 transition-colors duration-200">
              <div className="flex items-center mb-4 pb-3 border-b">
                <div className="p-2 rounded-lg bg-purple-50">
                  {React.cloneElement(section.icon, { className: "h-5 w-5 text-purple-600" })}
                </div>
                <h3 className="ml-3 text-base font-semibold text-gray-900">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    to={item.path || "#"}
                    className="flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-purple-50 group"
                  >
                    <div className="flex-shrink-0 p-1.5 rounded-md bg-gray-100 group-hover:bg-white">
                      {React.cloneElement(item.icon, { 
                        className: "h-5 w-5 text-gray-500 group-hover:text-purple-600" 
                      })}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">{item.name}</p>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transform transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const StatsCard = ({ icon, title, value, subtitle, bgColor, trend, trendUp }) => (
  <div className="rounded-xl bg-white p-5 shadow-md border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
    <div className="flex items-center">
      <div className={`rounded-xl ${bgColor} p-3 shadow-sm`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <span className={`ml-2 flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${
              trendUp 
                ? 'text-green-700 bg-green-50 border border-green-200' 
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {trend}
              <ArrowUpRight className={`ml-0.5 h-3 w-3 ${!trendUp && 'rotate-90'}`} />
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

export default HomePage;