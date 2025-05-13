"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Package,
  Users,
  ShoppingCart,
  Grid,
  BarChart2,
  Truck,
  Settings,
  Percent,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Calendar,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Layout = ({ children, stats }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && sidebarOpen && !event.target.closest(".sidebar")) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen])

  return (
    <div className={`flex h-screen bg-gray-50 ${darkMode ? "dark" : ""}`}>
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              EcomAdmin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          <div className="py-4">
            <div className="mb-6 px-4">
              <div className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-md">
                <div className="relative">
                  <img
                    src="https://ui-avatars.com/api/?name=Admin+User&background=6d28d9&color=fff"
                    alt="Admin"
                    className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-purple-100">admin@example.com</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1 px-3">
              <Link
                to="/"
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive("/")
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    isActive("/")
                      ? "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </div>
                <span>Dashboard</span>
              </Link>

              <div className="space-y-1">
                <Link
                  to="/products"
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive("/products")
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      isActive("/products")
                        ? "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <span>Products</span>
                  {isActive("/products") && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>

                {isActive("/products") && (
                  <div className="pl-11 space-y-1 animate-fadeIn">
                    <Link
                      to="/products/add"
                      className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                        isActive("/products/add")
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <span>Add Product</span>
                    </Link>
                    <Link
                      to="/products/categories"
                      className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                        isActive("/products/categories")
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <span>Categories</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Link
                  to="/orders"
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive("/orders")
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      isActive("/orders")
                        ? "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <span>Orders</span>
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800/60 px-1.5 text-xs font-medium text-purple-800 dark:text-purple-300">
                    {stats?.orderCount || 0}
                  </span>
                  {isActive("/orders") && <ChevronRight className="ml-2 h-4 w-4" />}
                </Link>

                {isActive("/orders") && (
                  <div className="pl-11 space-y-1 animate-fadeIn">
                    <Link
                      to="/orders/pending"
                      className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                        isActive("/orders/pending")
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <span>Pending</span>
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-1.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                        {stats?.ordersByStatus?.Pending || 0}
                      </span>
                    </Link>
                    <Link
                      to="/orders/processing"
                      className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                        isActive("/orders/processing")
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <span>Processing</span>
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-1.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                        {stats?.ordersByStatus?.Processing || 0}
                      </span>
                    </Link>
                    <Link
                      to="/orders/delivered"
                      className={`flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                        isActive("/orders/delivered")
                          ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <span>Delivered</span>
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 px-1.5 text-xs font-medium text-green-800 dark:text-green-300">
                        {stats?.ordersByStatus?.Delivered || 0}
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Other navigation links */}
              {[
                { path: "/customers", icon: Users, label: "Customers" },
                { path: "/analytics", icon: BarChart2, label: "Analytics" },
                {
                  path: "/inventory",
                  icon: Grid,
                  label: "Inventory",
                  badge:
                    stats?.lowStock > 0
                      ? {
                          count: stats.lowStock,
                          color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
                        }
                      : null,
                },
                { path: "/shipping", icon: Truck, label: "Shipping" },
                { path: "/discounts", icon: Percent, label: "Discounts" },
                { path: "/settings", icon: Settings, label: "Settings" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      isActive(item.path)
                        ? "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full ${item.badge.color} px-1.5 text-xs font-medium`}
                    >
                      {item.badge.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <button
                onClick={toggleDarkMode}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-50 dark:bg-red-900/20 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 transition-colors duration-200 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div
            className={`relative flex w-full max-w-md items-center rounded-lg border ${
              searchFocused
                ? "border-purple-400 dark:border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900/30"
                : "border-gray-200 dark:border-gray-700"
            } bg-white dark:bg-gray-800 px-3 py-2 shadow-sm transition-all duration-200 lg:max-w-lg`}
          >
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-full bg-transparent pl-2 text-sm text-gray-700 dark:text-gray-300 outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden items-center rounded-lg bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 text-sm text-purple-700 dark:text-purple-300 md:flex">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>

            <div className="relative">
              <button className="relative rounded-full p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                <Bell className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                  7
                </span>
              </button>
            </div>

            <div className="relative">
              <button className="flex items-center space-x-2 rounded-full p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=6d28d9&color=fff"
                  alt="Admin"
                  className="h-8 w-8 rounded-full border-2 border-purple-200 dark:border-purple-800 shadow-sm"
                />
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
