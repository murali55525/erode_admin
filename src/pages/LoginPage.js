import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (login(username, password)) {
      // Login will now automatically store the token
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#234781]/10 to-gray-100">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#234781] flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] opacity-20 bg-cover bg-center"></div>
        <div className="z-10 text-white text-center p-8 max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome to Erode Fancy</h1>
          <p className="text-xl opacity-80">Manage your products, orders, and customers efficiently from one dashboard.</p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">Easy Management</h3>
              <p className="opacity-80">Control your inventory and track sales with ease</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">Real-time Analytics</h3>
              <p className="opacity-80">Get instant insights into your business performance</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#234781] mb-4">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            {error && (
              <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#234781] focus:border-[#234781] transition-all duration-200"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#234781] focus:border-[#234781] transition-all duration-200"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#234781] focus:ring-[#234781] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-[#234781] hover:text-[#234781]/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-[#234781] hover:bg-[#234781]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#234781] transition-all duration-200 font-medium text-base"
                >
                  Sign in
                  <span className="absolute right-3 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-600">
            Need help? Contact{' '}
            <a href="mailto:support@erodefancy.com" className="font-medium text-[#234781] hover:text-[#234781]/80">
              support@erodefancy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
