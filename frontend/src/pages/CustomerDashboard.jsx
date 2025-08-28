import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="customer-dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.first_name}!</h2>
          <p className="text-gray-600">
            This is your customer dashboard where you can manage your bookings and view service providers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">My Bookings</h3>
            <p className="text-gray-600">View and manage your service bookings</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Browse Services</h3>
            <p className="text-gray-600">Find new service providers for your events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;