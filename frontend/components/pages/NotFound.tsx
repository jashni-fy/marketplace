import React from 'react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-12">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-9xl font-bold text-slate-700 select-none">404</h1>
            <div className="absolute inset-0 text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
              404
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-50">Not Found</h2>
            <p className="text-slate-400 text-sm">
              Page doesn't exist
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-block btn-primary px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link 
              href="/frontend/components/pages/marketplace"
              className="text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-slate-800"
            >
              Browse
            </Link>
            <span className="text-slate-600">•</span>
            <Link 
              href="/login" 
              className="text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-slate-800"
            >
              Login
            </Link>
            <span className="text-slate-600">•</span>
            <Link 
              href="/register" 
              className="text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-slate-800"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 opacity-20">
          <div className="flex justify-center space-x-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;