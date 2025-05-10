// src/pages/CustomersPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const BASE_URL = 'http://localhost:5000';

const CustomersPage = () => {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, ordersByStatus: {}, lowStock: 0 });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const headers = { 'Content-Type': 'application/json' };
        const [customersRes, adminData] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/users`, { headers }),
          axios.get(`${BASE_URL}/api/admin/data`, { headers })
        ]);

        // Add null checks and ensure data exists
        const customersData = customersRes.data?.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);

        // Update stats with null checks
        setStats({
          orderCount: adminData.data?.data?.counts?.orders || 0,
          ordersByStatus: adminData.data?.data?.stats?.ordersByStatus || {},
          lowStock: adminData.data?.data?.stats?.lowStock || 0
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(`Failed to load customers: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCustomers();
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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.isArray(customers) && customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.email || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.phone || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{customer.orders?.length || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default CustomersPage;