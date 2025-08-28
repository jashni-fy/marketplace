import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { AppProvider } from './contexts/AppContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Import placeholder components (to be implemented in future tasks)
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MarketplaceHome from './pages/MarketplaceHome.jsx';
import ServiceSearch from './pages/ServiceSearch.jsx';
import VendorProfile from './pages/VendorProfile.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import BookingFlow from './pages/BookingFlow.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFound from './pages/NotFound.jsx';

import './App.css';

// Component to redirect to appropriate dashboard based on user role
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  } else if (user?.role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />;
  } else {
    return <Navigate to="/marketplace" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<MarketplaceHome />} />
              <Route path="/services" element={<ServiceSearch />} />
              <Route path="/vendors/:id" element={<VendorProfile />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes for customers */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:serviceId"
                element={
                  <ProtectedRoute requiredRole="customer">
                    <BookingFlow />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes for vendors */}
              <Route
                path="/vendor/dashboard"
                element={
                  <ProtectedRoute requiredRole="vendor">
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect based on user role */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
