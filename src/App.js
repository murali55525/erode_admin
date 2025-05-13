// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InventoryPage from './pages/InventoryPage';
import ShippingPage from './pages/ShippingPage';
import DiscountsPage from './pages/DiscountsPage';
import AddProductPage from './pages/AddProductPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import EditProductPage from './pages/EditProductPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Verify this path

const AppRoutes = () => {
  const { user, activeSession } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/add"
        element={
          <ProtectedRoute>
            <AddProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <EditProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomersPage
              userProfile={user?.profilePicture}
              activeSession={activeSession}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipping"
        element={
          <ProtectedRoute>
            <ShippingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discounts"
        element={
          <ProtectedRoute>
            <DiscountsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;