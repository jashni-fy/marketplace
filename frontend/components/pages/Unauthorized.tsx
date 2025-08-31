import React from 'react';
import Link from 'next/link';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please make sure you're logged in with the correct account type.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login with different account
            </Link>
            {' | '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;