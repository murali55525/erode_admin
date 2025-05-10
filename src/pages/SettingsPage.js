import React, { useState } from 'react';
import { Settings, Mail, Lock, User, Bell, Shield, Bookmark, Save } from 'lucide-react';
import Layout from '../components/Layout';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [generalSettings, setGeneralSettings] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: true,
    stockAlerts: true,
    customerMessages: true,
    marketingUpdates: false,
  });

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    // Handle general settings update
    console.log('General settings:', generalSettings);
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px,1fr]">
        {/* Settings Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
              activeTab === 'general' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>General Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
              activeTab === 'notifications' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
              activeTab === 'security' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lock className="h-5 w-5" />
            <span>Security</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                    type="text"
                    value={generalSettings.storeName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{key}</h3>
                    <p className="text-sm text-gray-500">Receive notifications for {key}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key)}
                    className={`${
                      value ? 'bg-purple-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        value ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <div className="mt-4 space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
