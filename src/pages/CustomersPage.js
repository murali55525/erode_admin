import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingCart, Heart, History, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'https://render-1-ehkn.onrender.com';

const CustomersPage = ({ userProfile, activeSession }) => {
  const { token } = useAuth() || {};
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userOrders, setUserOrders] = useState({});
  const [userWishlists, setUserWishlists] = useState({});
  const [userCarts, setUserCarts] = useState({});
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchCustomersAndActivity = async () => {
      try {
        setLoading(true);

        // Fetch all users with comprehensive details
        const usersResponse = await axios.get(`${BASE_URL}/api/admin/users/all`);
        const allUsers = usersResponse.data?.data || [];
        setCustomers(allUsers);

        // Fetch users-orders data which includes orders, wishlists, and other user activity
        const userActivityResponse = await axios.get(`${BASE_URL}/api/admin/users-orders`);
        const userActivity = userActivityResponse.data?.analyticsData || [];
        
        // Process and organize user activity data
        const orders = {};
        const wishlists = {};
        const carts = {};
        
        userActivity.forEach(data => {
          if (data.user && data.user.id) {
            // Map orders to users
            orders[data.user.id] = data.orders || [];
            
            // Map wishlists to users
            wishlists[data.user.id] = data.wishlist || [];
            
            // Initialize cart data structure (will be populated later)
            carts[data.user.id] = [];
          }
        });
        
        setUserOrders(orders);
        setUserWishlists(wishlists);
        setUserCarts(carts);

        // Update stats based on the fetched data
        const ordersStats = userActivityResponse.data?.summary || {};
        setStats({
          orderCount: ordersStats.totalOrders || 0,
          ordersByStatus: ordersStats.ordersByStatus || {},
          lowStock: 0, // Could be updated with a products API call if needed
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load customer data');
        setLoading(false);
      }
    };

    fetchCustomersAndActivity();
  }, [token]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setActiveTab('orders'); // Reset to orders tab when opening modal
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout stats={stats}>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout stats={stats}>
      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800">
          <span>{error}</span>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-[#234781]" />
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {activeSession?.isActive ? 'Active Now' : 'Offline'}
            </p>
            <p className="text-xs text-gray-500">
              {activeSession?.startTime &&
                `Since ${new Date(activeSession.startTime).toLocaleString()}`}
            </p>
          </div>
          <img
            src={userProfile || 'https://via.placeholder.com/40'}
            alt="Admin Profile"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#234781]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Wishlist</th>
                <th className="px-4 py-3">Login Type</th>
                <th className="px-4 py-3">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(customers) && customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleUserClick(customer)}
                  >
                    <td className="px-4 py-3">
                      {customer.profileImage ? (
                        <img
                          src={customer.profileImage}
                          alt={customer.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-[#234781]/20"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="100%" height="100%" fill="%23234781"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em">${customer.name?.charAt(0).toUpperCase() || 'U'}</text></svg>`;
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#234781] flex items-center justify-center text-white font-medium text-sm border-2 border-[#234781]/20">
                          {customer.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {customer.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-blue-100 text-blue-800">
                        {userOrders[customer.id]?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-pink-100 text-pink-800">
                        {userWishlists[customer.id]?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {customer.isGoogle ? (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {customer.lastLogin
                        ? new Date(customer.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-4xl h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b border-gray-200 pb-6">
              {selectedUser.profileImage ? (
                <img
                  src={selectedUser.profileImage}
                  alt={selectedUser.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-[#234781]/20"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="100%" height="100%" fill="%23234781"/><text x="50%" y="50%" font-size="48" fill="white" text-anchor="middle" dy=".3em">${selectedUser.name?.charAt(0).toUpperCase() || 'U'}</text></svg>`;
                  }}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-[#234781] flex items-center justify-center text-white font-medium text-3xl border-4 border-[#234781]/20">
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-semibold text-gray-900">{selectedUser.name || 'N/A'}</h3>
                <p className="text-md text-gray-600">{selectedUser.email || 'N/A'}</p>
                <p className="text-sm text-gray-600">{selectedUser.phone || 'No phone provided'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${
                    selectedUser.isGoogle ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.isGoogle ? 'Google Account' : 'Standard Account'}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${
                    selectedUser.verificationStatus === 'Verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.verificationStatus || 'Unverified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase">Customer Since</h4>
                <p className="text-lg font-medium text-gray-900">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase">Last Login</h4>
                <p className="text-lg font-medium text-gray-900">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase">Total Spent</h4>
                <p className="text-lg font-medium text-gray-900">
                  ₹{selectedUser.orderHistory?.totalSpent?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Tabs for different user activities */}
            <div className="mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    className={`py-4 px-1 text-sm font-medium ${
                      activeTab === 'orders'
                        ? 'border-b-2 border-[#234781] text-[#234781]'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Orders ({userOrders[selectedUser.id]?.length || 0})
                    </div>
                  </button>
                  <button
                    className={`py-4 px-1 text-sm font-medium ${
                      activeTab === 'wishlist'
                        ? 'border-b-2 border-[#234781] text-[#234781]'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('wishlist')}
                  >
                    <div className="flex items-center">
                      <Heart className="mr-2 h-5 w-5" />
                      Wishlist ({userWishlists[selectedUser.id]?.length || 0})
                    </div>
                  </button>
                  <button
                    className={`py-4 px-1 text-sm font-medium ${
                      activeTab === 'loginHistory'
                        ? 'border-b-2 border-[#234781] text-[#234781]'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('loginHistory')}
                  >
                    <div className="flex items-center">
                      <History className="mr-2 h-5 w-5" />
                      Login History
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab content */}
              <div className="mt-4">
                {/* Orders Tab Content */}
                {activeTab === 'orders' && (
                  <>
                    {userOrders[selectedUser.id]?.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              <th className="px-4 py-2">Order ID</th>
                              <th className="px-4 py-2">Date</th>
                              <th className="px-4 py-2">Items</th>
                              <th className="px-4 py-2">Total</th>
                              <th className="px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {userOrders[selectedUser.id].map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{order.id}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {order.items?.length || 0}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  ₹{order.totalAmount?.toFixed(2) || '0.00'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                      order.status === 'Delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : order.status === 'Processing'
                                        ? 'bg-blue-100 text-blue-800'
                                        : order.status === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : order.status === 'Cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm">No orders found for this customer.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Wishlist Tab Content */}
                {activeTab === 'wishlist' && (
                  <>
                    {userWishlists[selectedUser.id]?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2">
                        {userWishlists[selectedUser.id].map((item, index) => (
                          <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="object-cover w-full h-32"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/150';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
                              <p className="text-sm text-gray-700 mt-1">₹{item.price?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <Heart className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm">No wishlist items found for this customer.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Login History Tab Content */}
                {activeTab === 'loginHistory' && (
                  <>
                    {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                              <th className="px-4 py-2">#</th>
                              <th className="px-4 py-2">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedUser.loginHistory.map((loginTime, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {new Date(loginTime).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-gray-500">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm">No login history available for this customer.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Additional customer info */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
              
              {/* Addresses */}
              <div className="mb-6">
                <h5 className="text-md font-medium text-gray-700 mb-2">Shipping Addresses</h5>
                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.addresses.map((address, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <p className="text-sm">{address.address}</p>
                        <p className="text-sm">{address.contact}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No saved addresses</p>
                )}
              </div>
              
              {/* Preferred Categories */}
              {selectedUser.preferredCategories && selectedUser.preferredCategories.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-700 mb-2">Preferred Categories</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.preferredCategories.map((category, index) => (
                      <span key={index} className="bg-[#234781]/10 px-2 py-1 rounded-full text-xs text-[#234781]">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notification Preferences */}
              {selectedUser.notifications && (
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-2">Notification Preferences</h5>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <span className={`h-3 w-3 rounded-full ${selectedUser.notifications.email ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                      <span className="text-sm">Email: {selectedUser.notifications.email ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`h-3 w-3 rounded-full ${selectedUser.notifications.push ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                      <span className="text-sm">Push: {selectedUser.notifications.push ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`h-3 w-3 rounded-full ${selectedUser.notifications.sms ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                      <span className="text-sm">SMS: {selectedUser.notifications.sms ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomersPage;