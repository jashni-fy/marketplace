import React from 'react';
import Link from 'next/link';

const Home = () => {
  const imageUrls = [
    'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975682031-6c4b1c0b03ef?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975922069-364486c1b93f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop'
  ];

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Find the Perfect Service Provider
          </h1>
          <p className="text-xl mb-8">
            Connect with photographers, videographers, and event managers for your special occasions
          </p>
          <div className="space-x-4">
            <Link
              href="/marketplace"
              className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 min-w-[200px] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Services
            </Link>
            <Link
              href="/register"
              className="btn-success px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 min-w-[200px] flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Join as Vendor
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <div className="relative z-10 py-20 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-50 mb-4">How It Works</h2>
            <p className="text-xl text-slate-300">Simple steps to find and book amazing services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-slate-800/80 border-slate-700 text-center hover:border-blue-500 transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-4">1. Browse Services</h3>
              <p className="text-slate-300 leading-relaxed">Explore our marketplace to find the perfect service provider for your needs</p>
            </div>

            <div className="card bg-slate-800/80 border-slate-700 text-center hover:border-emerald-500 transition-all duration-300 group">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-500/30 transition-colors">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-4">2. Book & Connect</h3>
              <p className="text-slate-300 leading-relaxed">Send booking requests and communicate directly with service providers</p>
            </div>

            <div className="card bg-slate-800/80 border-slate-700 text-center hover:border-purple-500 transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-4">3. Enjoy Your Event</h3>
              <p className="text-slate-300 leading-relaxed">Relax knowing you have professional service providers handling your event</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="card bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-slate-300 mb-8">Join thousands of satisfied customers and vendors</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register?role=customer"
                className="btn-primary px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                I Need Services
              </Link>
              <Link
                href="/register?role=vendor"
                className="btn-secondary px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                I Provide Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Home;