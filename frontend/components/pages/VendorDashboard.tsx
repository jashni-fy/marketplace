'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { apiService } from '../../lib/api';
import ServiceManagement from '../ServiceManagement';
import PortfolioManager from '../PortfolioManager';
import BookingCalendar from '../BookingCalendar';

interface Service {
  id: string;
  name: string;
  status: string;
  formatted_price: string;
}

interface Booking {
  id: string;
  service_name: string;
  event_date: string;
  status: string;
  total_amount?: number;
}

interface DashboardMetrics {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

interface DashboardData {
  services: Service[];
  bookings: Booking[];
  metrics: DashboardMetrics;
}

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    services: [],
    bookings: [],
    metrics: {
      totalServices: 0,
      activeServices: 0,
      totalBookings: 0,
      pendingBookings: 0,
      completedBookings: 0,
      totalRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load services for the current vendor
      const servicesResponse = await apiService.services.getAll();
      const services = servicesResponse.data.services || [];

      // Load bookings (when booking API is available)
      // const bookingsResponse = await apiService.bookings.getAll();
      // const bookings = bookingsResponse.data.bookings || [];
      const bookings: Booking[] = []; // Placeholder until booking API is implemented

      // Calculate metrics
      const metrics: DashboardMetrics = {
        totalServices: services.length,
        activeServices: services.filter((s: Service) => s.status === 'active').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalRevenue: bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0)
      };

      setDashboardData({
        services,
        bookings,
        metrics
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = () => {
    loadDashboardData();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-3xl mb-2">🏢</div>
          <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.totalServices}</p>
          <p className="text-xs text-gray-600">Services</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.activeServices}</p>
          <p className="text-xs text-gray-600">Active</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-2xl font-bold text-gray-900">{dashboardData.metrics.totalBookings}</p>
          <p className="text-xs text-gray-600">Bookings</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-2xl font-bold text-gray-900">${dashboardData.metrics.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-600">Revenue</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span>🛠️</span> Services
          </h3>
          {dashboardData.services.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <p className="font-medium truncate">{service.name}</p>
                    <p className="text-xs text-gray-600">{service.formatted_price}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    service.status === 'active' ? 'bg-green-100 text-green-800' :
                    service.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-600 text-xs">Create your first service!</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <span>⏳</span> Pending
          </h3>
          {dashboardData.metrics.pendingBookings > 0 ? (
            <div className="space-y-2">
              {dashboardData.bookings
                .filter(b => b.status === 'pending')
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-medium truncate">{booking.service_name}</p>
                      <p className="text-xs text-gray-600">{booking.event_date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-600 text-xs">No pending bookings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600 text-sm">Hi {user?.first_name}!</p>
          </div>
          <button
            onClick={logout}
            className="btn-danger px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'services', name: 'Services', icon: '🛠️' },
              { id: 'portfolio', name: 'Portfolio', icon: '🖼️' },
              { id: 'calendar', name: 'Calendar', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && (
            <ServiceManagement 
              services={dashboardData.services}
              onServiceUpdate={handleServiceUpdate}
            />
          )}
          {activeTab === 'portfolio' && <PortfolioManager />}
          {activeTab === 'calendar' && <BookingCalendar bookings={dashboardData.bookings} />}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;