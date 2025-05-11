import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'http://localhost:5000';

const CustomersPage = ({ userProfile, activeSession }) => {
  const { token } = useAuth() || {};
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userOrders, setUserOrders] = useState({});

  useEffect(() => {
    const fetchCustomersAndOrders = async () => {
      try {
        setLoading(true);

        // Fetch all users (no authentication required)
        const usersResponse = await axios.get(`${BASE_URL}/api/admin/users/all`);
        const allUsers = usersResponse.data?.data || [];
        setCustomers(allUsers);

        // Fetch orders (requires admin authentication)
        if (token) {
          const ordersResponse = await axios.get(`${BASE_URL}/api/admin/orders`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const allOrders = ordersResponse.data?.data || [];

          // Map orders to users
          const ordersByUser = allUsers.reduce((acc, user) => {
            acc[user.id] = allOrders.filter(
              (order) => order.userId?._id.toString() === user.id
            );
            return acc;
          }, {});
          setUserOrders(ordersByUser);

          // Update stats
          setStats({
            orderCount: allOrders.length,
            ordersByStatus: allOrders.reduce((acc, order) => {
              acc[order.status] = (acc[order.status] || 0) + 1;
              return acc;
            }, {}),
            lowStock: 0, // Could be updated with a products API call if needed
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load customers');
        setLoading(false);
      }
    };

    fetchCustomersAndOrders();
  }, [token]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
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
        <table className="w-full">
          <thead>
            <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Login Type</th>
              <th className="px-4 py-3">Joined</th>
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
                        className="h-8 w-8 rounded-full object-cover border-2 border-[#234781]/20"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="100%" height="100%" fill="%23234781"/><text x="50%" y="50%" font-size="16" fill="white" text-anchor="middle" dy=".3em">${customer.name?.charAt(0).toUpperCase() || 'U'}</text></svg>`;
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#234781] flex items-center justify-center text-white font-medium text-sm border-2 border-[#234781]/20">
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
                    {userOrders[customer.id]?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {customer.isGoogle ? 'Google' : 'Standard'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
              {selectedUser.profileImage ? (
                <img
                  src={selectedUser.profileImage}
                  alt={selectedUser.name}
                  className="h-20 w-20 rounded-full object-cover border-2 border-[#234781]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="100%" height="100%" fill="%23234781"/><text x="50%" y="50%" font-size="40" fill="white" text-anchor="middle" dy=".3em">${selectedUser.name?.charAt(0).toUpperCase() || 'U'}</text></svg>`;
                  }}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#234781] flex items-center justify-center text-white font-medium text-2xl border-2 border-[#234781]">
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name || 'N/A'}</h3>
                <p className="text-sm text-gray-600">{selectedUser.email || 'N/A'}</p>
                <p className="text-sm text-[#234781] font-medium">
                  {selectedUser.isGoogle ? 'Google Account' : 'Standard Account'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Joined</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.updatedAt
                    ? new Date(selectedUser.updatedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-sm text-gray-900">
                  {userOrders[selectedUser.id]?.length || 0}
                </p>
              </div>
            </div>

            {userOrders[selectedUser.id]?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900">Order History</h4>
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-2">Order ID</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Total</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userOrders[selectedUser.id].map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{order._id}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            ₹{order.totalAmount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
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
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CustomersPage;