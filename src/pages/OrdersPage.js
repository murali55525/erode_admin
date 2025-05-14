import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Eye, Filter, Download, User } from 'lucide-react';
import Layout from '../components/Layout';

const CLIENT_BASE_URL = 'https://render-1-ehkn.onrender.com';
const ADMIN_BASE_URL = 'https://render-1-ehkn.onrender.com';

const OrdersPage = ({ userProfile, activeSession }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [processingUpdate, setProcessingUpdate] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { 'Content-Type': 'application/json' };

        // Fetch users from client server (Port 5000, unauthenticated)
        const usersRes = await axios.get(`${CLIENT_BASE_URL}/api/admin/users/all`, { headers });
        const users = usersRes.data?.data || [];
        const usersMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsersMap(usersMap);

        // Fetch orders and stats from client server (Port 5000, unauthenticated)
        const [ordersRes, ordersStats] = await Promise.all([
          axios.get(`${CLIENT_BASE_URL}/api/admin/orders`, { headers }),
          axios.get(`${CLIENT_BASE_URL}/api/admin/orders-stats`, { headers }),
        ]);

        setOrders(
          ordersRes.data.data.map((order) => ({
            id: order._id,
            userId: order.userId?._id,
            customerName: usersMap[order.userId?._id]?.name || order.userId?.name || 'Unknown',
            customerEmail: usersMap[order.userId?._id]?.email || order.userId?.email || 'N/A',
            customerPhone: usersMap[order.userId?._id]?.phone || order.userId?.phone || 'N/A',
            amount: order.totalAmount || 0,
            status: order.status,
            date: new Date(order.createdAt).toLocaleDateString(),
            items: order.items || [],
            shippingInfo: order.shippingInfo || {},
            orderDate: order.createdAt,
            paymentStatus: order.paymentStatus || 'N/A',
          }))
        );

        setStats({
          orderCount: ordersStats.data.data.total,
          ordersByStatus: {
            Pending: ordersStats.data.data.pending,
            Delivered: ordersStats.data.data.delivered,
          },
          totalRevenue: ordersStats.data.data.totalRevenue,
          lowStock: 0,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show notification for 3 seconds then hide
  useEffect(() => {
    if (statusUpdateSuccess) {
      const timer = setTimeout(() => {
        setStatusUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusUpdateSuccess]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
      // Prevent multiple clicks
      if (processingUpdate) return;
      
      setProcessingUpdate(true);
      setError(null);
      
      // Log the request for debugging
      console.log(`Updating order ${orderId} to status: ${status}`);
      
      // Make the API call with appropriate headers
      const response = await axios.put(
        `${CLIENT_BASE_URL}/api/admin/orders/${orderId}`,
        { status },
        { 
          headers: { 
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Update response:', response.data);
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      // Update modal if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status});
      }
      
      // Show success notification
      setStatusUpdateSuccess(true);
      
    } catch (err) {
      console.error("Error updating order status:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to update order status: ${errorMessage}`);
    } finally {
      setProcessingUpdate(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      // Prevent multiple clicks
      if (processingUpdate) return;
      
      setProcessingUpdate(true);
      setError(null);
      
      await axios.put(
        `${CLIENT_BASE_URL}/api/admin/orders/${orderId}`,
        { status: 'Cancelled' },
        { 
          headers: { 
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'Cancelled' } : order
        )
      );
      
      // Update modal if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({...selectedOrder, status: 'Cancelled'});
      }
      
      // Show success notification
      setStatusUpdateSuccess(true);
      
    } catch (err) {
      console.error("Error cancelling order:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to cancel order: ${errorMessage}`);
    } finally {
      setProcessingUpdate(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      setError(null);
      const response = await axios.get(`${ADMIN_BASE_URL}/api/admin/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });

      // Create a download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      setError(`Failed to download invoice: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
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
      {/* Status update notification */}
      {statusUpdateSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-3 rounded-lg shadow-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Order status updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-800">
          <span>{error}</span>
          <button 
            className="ml-auto text-red-600 hover:text-red-800" 
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <ShoppingCart className="h-6 w-6 text-[#234781]" />
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
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
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="font-bold text-gray-900">All Orders</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        {/* Responsive table with horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <span className="hidden md:inline">{order.id}</span>
                      <span className="md:hidden">{order.id.substr(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{order.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadInvoice(order.id);
                        }}
                        className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Invoice</span>
                      </button>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'Delivered');
                          }}
                          disabled={processingUpdate}
                          className={`inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-100 ${processingUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {processingUpdate ? 'Updating...' : 'Mark Delivered'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-5xl h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold text-gray-900">Order #{selectedOrder.id}</h3>
              <p className="text-sm text-gray-600">
                Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Customer Details</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {selectedOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {selectedOrder.customerEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedOrder.customerPhone}
                  </p>
                  <Link
                    to={`/customers/${selectedOrder.userId}`}
                    className="inline-flex items-center text-sm text-[#234781] hover:underline"
                  >
                    <User className="mr-1 h-4 w-4" />
                    View Customer Profile
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Shipping Information</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span>{' '}
                    {selectedOrder.shippingInfo?.address || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contact:</span>{' '}
                    {selectedOrder.shippingInfo?.contact || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
              <div className="mt-2 max-h-80 overflow-y-auto rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-[#234781]/10 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-2">Image</th>
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2">Color</th>
                        <th className="px-4 py-2">Quantity</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-16 w-16 rounded-md object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/48';
                                }}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                N/A
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name || 'Unknown'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {item.color ? (
                                <>
                                  <div 
                                    className="h-4 w-4 rounded-full mr-2" 
                                    style={{ backgroundColor: item.color.toLowerCase() }}
                                  ></div>
                                  <span className="text-sm text-gray-700">{item.color}</span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-700">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">₹{item.price?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          ₹{selectedOrder.amount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Order Summary</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total Amount:</span> ₹{selectedOrder.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Payment Status:</span> {selectedOrder.paymentStatus}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Order Status:</span>{' '}
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Admin Actions</h4>
                <div className="mt-2 space-y-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#234781]"
                    disabled={selectedOrder.status === 'Cancelled' || processingUpdate}
                  >
                    {['Pending', 'Processing', 'Delivered', 'Cancelled'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}
                    disabled={processingUpdate}
                    className={`w-full rounded-md bg-[#234781] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6b] transition-colors ${processingUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {processingUpdate ? 'Updating Status...' : 'Save Status'}
                  </button>
                  
                  {selectedOrder.status !== 'Cancelled' && (
                    <button
                      onClick={() => cancelOrder(selectedOrder.id)}
                      disabled={processingUpdate}
                      className={`w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors ${processingUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {processingUpdate ? 'Processing...' : 'Cancel Order'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => downloadInvoice(selectedOrder.id)}
                    disabled={processingUpdate}
                    className={`w-full rounded-md bg-[#234781] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6b] transition-colors ${processingUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrdersPage;