import React from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const VendorDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="vendor-dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
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
            This is your vendor dashboard where you can manage your services and bookings.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">My Services</h3>
            <p className="text-gray-600">Manage your service listings</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Bookings</h3>
            <p className="text-gray-600">View and respond to booking requests</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
            <p className="text-gray-600">Showcase your work and experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;