'use client';

import React from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-50 mb-1">Dashboard</h1>
            <p className="text-slate-400 text-sm">Hi {user?.first_name}! 👋</p>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-slate-800 border-slate-700 text-center p-4">
            <div className="text-4xl mb-2">📅</div>
            <h3 className="text-2xl font-bold text-slate-50 mb-1">0</h3>
            <p className="text-slate-400 text-xs">Bookings</p>
          </div>
          <div className="card bg-slate-800 border-slate-700 text-center p-4">
            <div className="text-4xl mb-2">⭐</div>
            <h3 className="text-2xl font-bold text-slate-50 mb-1">0</h3>
            <p className="text-slate-400 text-xs">Favorites</p>
          </div>
          <div className="card bg-slate-800 border-slate-700 text-center p-4">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-2xl font-bold text-slate-50 mb-1">$0</h3>
            <p className="text-slate-400 text-xs">Spent</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card bg-slate-800 border-slate-700 hover:border-blue-500 transition-all duration-300 group text-center p-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-50 mb-2">My Bookings</h3>
            <p className="text-slate-400 mb-4 text-xs">Manage bookings</p>
            <button className="btn-primary w-full rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 py-2">
              View
            </button>
          </div>

          <div className="card bg-slate-800 border-slate-700 hover:border-emerald-500 transition-all duration-300 group text-center p-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/30 transition-colors">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-50 mb-2">Browse Services</h3>
            <p className="text-slate-400 mb-4 text-xs">Find providers</p>
            <button className="btn-success w-full rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 py-2">
              Browse
            </button>
          </div>

          <div className="card bg-slate-800 border-slate-700 hover:border-purple-500 transition-all duration-300 group text-center p-6">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-50 mb-2">Profile</h3>
            <p className="text-slate-400 mb-4 text-xs">Edit settings</p>
            <button className="btn-secondary w-full rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 py-2">
              Edit
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-slate-50 mb-4">Activity</h2>
          <div className="card bg-slate-800 border-slate-700 text-center p-8">
            <div className="text-8xl mb-4">📋</div>
            <h3 className="text-base font-semibold text-slate-50 mb-2">No Activity</h3>
            <p className="text-slate-400 mb-4 text-xs">Start exploring!</p>
            <button className="btn-primary px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105">
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;