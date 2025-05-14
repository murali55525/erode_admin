// src/pages/AnalyticsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { 
  BarChart2, TrendingUp, Users, Package, ShoppingCart, 
  DollarSign, Calendar, RefreshCcw, ArrowUp, ArrowDown,
  Bell, AlertTriangle, Award, Clock, ChevronDown, Filter,
  Info, CheckCircle, XCircle, ClipboardList, TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'https://render-1-ehkn.onrender.com';

// Enhanced stat card with animation and better styling
const StatCard = ({ title, value, icon, subValue, subText, trend, color = 'purple' }) => {
  const colorMap = {
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  
  return (
    <div className={`rounded-lg bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px] duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-full ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      {subValue && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {subValue}
          </span>
          <span className="text-gray-500 ml-2">{subText}</span>
        </div>
      )}
    </div>
  );
};

// Card wrapper component for consistency
const CardWithHeader = ({ title, subtitle, icon, children, actionButton }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actionButton}
      </div>
      {children}
    </div>
  );
};

// Notification component
const Notification = ({ message, type = 'info' }) => {
  const typeStyles = {
    info: 'bg-blue-50 text-blue-800 border-blue-100',
    success: 'bg-green-50 text-green-800 border-green-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    error: 'bg-red-50 text-red-800 border-red-100',
  };
  
  const icons = {
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
  };
  
  return (
    <div className={`flex items-center space-x-2 p-3 rounded-md border ${typeStyles[type]} mb-4 animate-fadeIn`}>
      {icons[type]}
      <span className="text-sm">{message}</span>
    </div>
  );
};

const AnalyticsPage = () => {
  const { token } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });
  const [dateRange, setDateRange] = useState('30');
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const headers = { 'Content-Type': 'application/json' };
        
        // Fetch orders data
        const ordersRes = await axios.get(`${BASE_URL}/api/admin/orders`, { headers });
        const orders = ordersRes.data.data || [];

        // Fetch products data
        const productsRes = await axios.get(`${BASE_URL}/api/products`, { headers });
        const products = productsRes.data.data || [];

        // Process orders to create sales data
        const salesByMonth = orders.reduce((acc, order) => {
          const date = new Date(order.createdAt);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          
          if (!acc[monthYear]) {
            acc[monthYear] = {
              month: monthYear,
              sales: 0,
              orders: 0,
              customers: new Set(),
              avgOrderValue: 0
            };
          }
          
          acc[monthYear].sales += order.totalAmount || 0;
          acc[monthYear].orders += 1;
          if (order.user) acc[monthYear].customers.add(order.user);
          
          return acc;
        }, {});

        // Convert to array and sort by date
        const salesData = Object.values(salesByMonth).map(data => {
          const avgOrderValue = data.orders > 0 ? data.sales / data.orders : 0;
          return {
            ...data,
            customers: data.customers.size,
            avgOrderValue
          };
        }).sort((a, b) => {
          const [aMonth, aYear] = a.month.split('/');
          const [bMonth, bYear] = b.month.split('/');
          return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
        });

        setSalesData(salesData);

        // Generate category data for pie chart
        const categoryCount = products.reduce((acc, product) => {
          const category = product.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
          name,
          value
        }));
        setCategoryData(categoryData);

        // Find top selling products
        const productSales = {};
        orders.forEach(order => {
          if (order.items) {
            order.items.forEach(item => {
              if (!productSales[item.product]) {
                productSales[item.product] = {
                  id: item.product,
                  name: item.name || 'Unknown Product',
                  quantity: 0,
                  revenue: 0,
                  profit: 0
                };
              }
              productSales[item.product].quantity += item.quantity || 0;
              const revenue = (item.price * item.quantity) || 0;
              productSales[item.product].revenue += revenue;
              // Estimate profit (30% of revenue for demo purposes)
              productSales[item.product].profit += revenue * 0.3;
            });
          }
        });

        const topProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopProducts(topProducts);

        // Update stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const ordersByStatus = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});

        // Count unique customers
        const uniqueCustomers = new Set();
        orders.forEach(order => {
          if (order.user) uniqueCustomers.add(order.user);
        });

        // Count products with low stock
        const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length;

        // Calculate conversion rate (demo purposes)
        const conversionRate = uniqueCustomers.size > 0 
          ? ((orders.length / uniqueCustomers.size) * 100).toFixed(1) 
          : 0;
        
        setConversionRate(conversionRate);

        // Set example notifications
        setNotifications([
          { id: 1, message: 'Product "Fancy Dress" is now out of stock', type: 'warning' },
          { id: 2, message: 'Sales increased by 15% compared to last month', type: 'success' },
          { id: 3, message: '3 new orders need processing', type: 'info' }
        ]);

        setStats({
          orderCount: orders.length,
          ordersByStatus,
          totalRevenue,
          averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
          uniqueCustomers: uniqueCustomers.size,
          lowStockProducts
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(`Failed to load analytics: ${err.message}`);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // Colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  if (loading) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100">
              <RefreshCcw className="h-8 w-8 animate-spin text-purple-600" />
            </div>
            <p className="text-gray-600">Loading your analytics dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Format number with K/M suffix for readability
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  return (
    <Layout stats={stats}>
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800 border border-red-100">
          <XCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">Get insights into your business performance</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button 
            className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 flex items-center space-x-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          <select 
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button 
            className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 transition duration-200"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option>All Categories</option>
                {categoryData.map((cat, idx) => (
                  <option key={idx}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option>All Statuses</option>
                {Object.keys(stats.ordersByStatus || {}).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="From" />
                <input type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="To" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 mr-2">
              Reset
            </button>
            <button className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Notifications section */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Bell className="h-4 w-4 mr-1" />
            Recent Notifications
          </h2>
          <div className="space-y-2">
            {notifications.map(notification => (
              <Notification 
                key={notification.id} 
                message={notification.message} 
                type={notification.type} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Stats overview cards with enhanced colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue?.toLocaleString() || 0}`} 
          icon={<DollarSign className="h-6 w-6" />}
          subValue="12.5%"
          subText="vs last month"
          trend="up"
          color="purple"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orderCount || 0} 
          icon={<ShoppingCart className="h-6 w-6" />}
          subValue="5.2%"
          subText="vs last month"
          trend="up"
          color="blue"
        />
        <StatCard 
          title="Unique Customers" 
          value={stats.uniqueCustomers || 0} 
          icon={<Users className="h-6 w-6" />}
          subValue="3.1%"
          subText="vs last month"
          trend="up"
          color="green"
        />
        <StatCard 
          title="Low Stock Products" 
          value={stats.lowStockProducts || 0} 
          icon={<Package className="h-6 w-6" />}
          subValue="2.4%"
          subText="increase"
          trend="down"
          color="amber"
        />
      </div>
      
      {/* Additional metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardWithHeader 
          title="Conversion Rate" 
          subtitle="Percentage of visitors who made a purchase"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-gray-900">{conversionRate}%</span>
            <div className="mb-1 flex items-center text-green-500 text-sm">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>2.1%</span>
            </div>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full" 
              style={{ width: `${Math.min(conversionRate * 2, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Target: 50%</p>
        </CardWithHeader>
        
        <CardWithHeader 
          title="Average Order Value" 
          subtitle="Average amount spent per order"
          icon={<DollarSign className="h-5 w-5" />}
        >
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-gray-900">₹{stats.averageOrderValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</span>
            <div className="mb-1 flex items-center text-green-500 text-sm">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>4.3%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={salesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="avgOrderValue" stroke="#8884d8" fillOpacity={1} fill="url(#colorAvg)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardWithHeader>
        
        <CardWithHeader 
          title="Order Processing Time" 
          subtitle="Average time to fulfill an order"
          icon={<Clock className="h-5 w-5" />}
        >
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-gray-900">1.4 days</span>
            <div className="mb-1 flex items-center text-red-500 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>0.3 days slower</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-purple-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Processing</p>
              <p className="font-semibold text-purple-700">0.5 days</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Packing</p>
              <p className="font-semibold text-blue-700">0.3 days</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Shipping</p>
              <p className="font-semibold text-green-700">0.6 days</p>
            </div>
          </div>
        </CardWithHeader>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
        <CardWithHeader 
          title="Revenue Overview" 
          subtitle="Monthly revenue analysis"
          icon={<BarChart2 className="h-5 w-5" />}
          actionButton={
            <div className="text-xs text-gray-500 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span>Current Period</span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${formatNumber(value)}`} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                name="Sales (₹)" 
                stroke="#8884d8" 
                strokeWidth={3}
                fill="url(#colorSales)" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardWithHeader>
        
        <CardWithHeader 
          title="Orders vs Customers" 
          subtitle="Relationship between orders and unique customers"
          icon={<ClipboardList className="h-5 w-5" />}
          actionButton={
            <div className="bg-gray-50 p-1 rounded-md">
              <select className="text-xs border-0 bg-transparent focus:ring-0">
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#82ca9d" barSize={20} radius={[4, 4, 0, 0]} />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="customers" 
                name="Unique Customers" 
                stroke="#ffc658" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardWithHeader>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-8">
        {/* Order Status */}
        <CardWithHeader 
          title="Order Status" 
          subtitle="Distribution of orders by status"
          icon={<CheckCircle className="h-5 w-5" />}
        >
          {Object.keys(stats.ordersByStatus || {}).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.ordersByStatus || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(stats.ordersByStatus || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No order status data available</div>
          )}
        </CardWithHeader>
        
        {/* Product Categories */}
        <CardWithHeader 
          title="Product Categories" 
          subtitle="Distribution of products by category"
          icon={<Package className="h-5 w-5" />}
        >
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Products']} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No category data available</div>
          )}
        </CardWithHeader>
        
        {/* Performance Metrics Radar */}
        <CardWithHeader 
          title="Performance Metrics" 
          subtitle="Business metrics comparison"
          icon={<Award className="h-5 w-5" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart outerRadius={90} data={[
              { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
              { subject: 'Orders', A: 98, B: 130, fullMark: 150 },
              { subject: 'Customers', A: 86, B: 130, fullMark: 150 },
              { subject: 'Returns', A: 99, B: 100, fullMark: 150 },
              { subject: 'Reviews', A: 85, B: 90, fullMark: 150 },
            ]}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar name="This Month" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Last Month" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardWithHeader>
      </div>
      
      {/* Top Products Table with enhanced UI */}
      <CardWithHeader 
        title="Top Selling Products" 
        subtitle="Products with highest revenue"
        icon={<Award className="h-5 w-5" />}
        actionButton={
          <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
            View All Products
          </button>
        }
        className="mb-8"
      >
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={product.id || index} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-md flex items-center justify-center text-purple-700 font-bold">
                          {product.name ? product.name.charAt(0) : '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name || 'Unknown Product'}</div>
                          <div className="text-xs text-gray-500">ID: {product.id ? product.id.toString().substring(0, 8) : 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{product.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${Math.min(80 - index * 15, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {Math.min(80 - index * 15, 100)}% of target
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No Product Data</h3>
            <p className="text-gray-500 mt-2">We couldn't find any product sales data to display.</p>
          </div>
        )}
      </CardWithHeader>
      
      {/* Order Status Details with enhanced design */}
      <CardWithHeader 
        title="Order Status Breakdown" 
        subtitle="Overview of orders by their current status"
        icon={<ClipboardList className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => {
            const getStatusColor = (status) => {
              switch(status.toLowerCase()) {
                case 'completed': return 'from-green-400 to-green-600';
                case 'processing': return 'from-blue-400 to-blue-600';
                case 'pending': return 'from-yellow-400 to-yellow-600';
                case 'cancelled': return 'from-red-400 to-red-600';
                default: return 'from-gray-400 to-gray-600';
              }
            };
            
            return (
              <div key={status} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 capitalize">{status}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
                  </div>
                  <div className={`h-10 w-10 rounded-md bg-gradient-to-br ${getStatusColor(status)} flex items-center justify-center text-white`}>
                    {status === 'completed' ? 
                      <CheckCircle className="h-6 w-6" /> : 
                      status === 'cancelled' ? 
                      <XCircle className="h-6 w-6" /> : 
                      <Clock className="h-6 w-6" />
                    }
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(status)}`}
                      style={{ width: `${(count / stats.orderCount * 100) || 0}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between items-center text-xs">
                    <span className="text-gray-500">{((count / stats.orderCount * 100) || 0).toFixed(1)}% of total</span>
                    <span className="font-medium text-gray-700">{count} orders</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardWithHeader>
      
      {/* Add a footer with additional information */}
      <div className="mt-8 text-center text-xs text-gray-500 pb-6">
        <p>Data last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Analytics dashboard powered by Erode Fancy Admin Panel</p>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;