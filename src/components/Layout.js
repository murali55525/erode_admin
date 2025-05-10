// src/components/Layout.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, Grid, BarChart2, Truck, Settings, Percent, Menu, XCircle, Search, Bell, ChevronDown, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, stats }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-between border-b border-purple-100 px-4">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-700" />
            <span className="text-xl font-bold text-purple-800">EcomAdmin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-full p-1.5 text-gray-500 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 lg:hidden">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="py-4">
          <div className="mb-6 px-4">
            <div className="flex items-center space-x-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-4 shadow-md">
              <img src="/api/placeholder/40/40" alt="Admin" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-purple-100">admin@example.com</p>
              </div>
            </div>
          </div>
          <nav className="space-y-1 px-3">
            <Link to="/" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Grid className="h-5 w-5" />
              </div>
              <span>Dashboard</span>
            </Link>
            <div className="space-y-1">
              <Link to="/products" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                  <Package className="h-5 w-5" />
                </div>
                <span>Products</span>
              </Link>
              <div className="pl-11 space-y-1">
                <Link to="/products/add" className="flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-700 transition-colors duration-200">
                  <span>Add Product</span>
                </Link>
              </div>
            </div>
            <div className="space-y-1">
              <Link to="/orders" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <span>Orders</span>
                <span className="ml-auto rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 shadow-sm">
                  {stats?.orderCount || 0}
                </span>
              </Link>
              <div className="pl-11 space-y-1">
                <Link to="/orders/pending" className="flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-700 transition-colors duration-200">
                  <span>Pending</span>
                  <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 shadow-sm">
                    {stats?.ordersByStatus?.Pending || 0}
                  </span>
                </Link>
                <Link to="/orders/processing" className="flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-700 transition-colors duration-200">
                  <span>Processing</span>
                  <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 shadow-sm">
                    {stats?.ordersByStatus?.Processing || 0}
                  </span>
                </Link>
                <Link to="/orders/delivered" className="flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-purple-700 transition-colors duration-200">
                  <span>Delivered</span>
                  <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 shadow-sm">
                    {stats?.ordersByStatus?.Delivered || 0}
                  </span>
                </Link>
              </div>
            </div>
            <Link to="/customers" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Users className="h-5 w-5" />
              </div>
              <span>Customers</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <BarChart2 className="h-5 w-5" />
              </div>
              <span>Analytics</span>
            </Link>
            <Link to="/inventory" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Grid className="h-5 w-5" />
              </div>
              <span>Inventory</span>
              {stats?.lowStock > 0 && (
                <span className="ml-auto rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 shadow-sm">
                  {stats.lowStock}
                </span>
              )}
            </Link>
            <Link to="/shipping" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Truck className="h-5 w-5" />
              </div>
              <span>Shipping</span>
            </Link>
            <Link to="/discounts" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Percent className="h-5 w-5" />
              </div>
              <span>Discounts</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-700">
                <Settings className="h-5 w-5" />
              </div>
              <span>Settings</span>
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <button onClick={handleLogout} className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-100">
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="rounded-full p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="flex w-full max-w-md items-center rounded-lg border border-gray-200 bg-gray-50 px-3 shadow-sm transition-all duration-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 lg:max-w-lg">
            <Search className="h-4 w-4 text-gray-500" />
            <input type="text" placeholder="Search products, orders, customers..." className="w-full bg-transparent py-2 pl-2 text-sm outline-none" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden items-center rounded-lg bg-purple-50 px-3 py-1.5 text-sm text-purple-700 md:flex">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="relative">
              <button className="rounded-full p-1.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200">
                <Bell className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">7</span>
              </button>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 rounded-full p-1 text-gray-700 hover:bg-purple-50 transition-colors duration-200">
                <img src="/api/placeholder/40/40" alt="Admin" className="h-8 w-8 rounded-full border-2 border-purple-200 shadow-sm" />
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-6 md:p-8">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;