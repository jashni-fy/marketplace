'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 mx-auto">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full"></div>
          <h1 className="relative text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 tracking-tighter">
            404
          </h1>
        </div>

        <div className="space-y-4 mb-10">
          <h2 className="text-3xl font-bold text-white">Page not found</h2>
          <p className="text-slate-400 text-lg max-w-sm mx-auto">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 bg-white text-violet-900 hover:bg-violet-50"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/search"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white"
          >
            <Search className="w-4 h-4" />
            Explore Services
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-slate-500 text-sm">
            Need help? <Link href="/support" className="text-violet-400 hover:text-violet-300 transition-colors">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;