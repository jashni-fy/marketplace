'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-50 mb-3">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-xl text-slate-300">
              {user?.role === 'vendor' 
                ? 'Manage your services and grow your business' 
                : 'Discover amazing services and manage your bookings'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    {user?.role === 'vendor' ? 'Active Services' : 'Active Bookings'}
                  </p>
                  <p className="text-2xl font-bold text-slate-50">0</p>
                </div>
              </div>
            </div>

            <div className="card bg-slate-800 border-slate-700 hover:border-emerald-500 transition-all duration-300">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    {user?.role === 'vendor' ? 'Total Earnings' : 'Total Spent'}
                  </p>
                  <p className="text-2xl font-bold text-slate-50">$0</p>
                </div>
              </div>
            </div>

            <div className="card bg-slate-800 border-slate-700 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    {user?.role === 'vendor' ? 'Total Customers' : 'Favorite Vendors'}
                  </p>
                  <p className="text-2xl font-bold text-slate-50">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-slate-800 border-slate-700">
            <h3 className="text-2xl font-bold text-slate-50 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === 'vendor' ? (
                <>
                  <a
                    href="/vendor/dashboard"
                    className="btn-primary px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Manage Services
                  </a>
                  <a
                    href="/vendor/bookings"
                    className="btn-success px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View Bookings
                  </a>
                  <a
                    href="/vendor/portfolio"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Portfolio
                  </a>
                  <a
                    href="/vendor/calendar"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/marketplace"
                    className="btn-primary px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Services
                  </a>
                  <a
                    href="/customer/dashboard"
                    className="btn-success px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Bookings
                  </a>
                  <a
                    href="/customer/favorites"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favorites
                  </a>
                  <a
                    href="/customer/profile"
                    className="btn-secondary px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center"
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}