import React from 'react';
import Link from 'next/link';

const Home = () => {

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
              href="/marketplacehome"
              className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 min-w-[200px] flex items-center justify-center gap-3"
            >
              Browse Services
            </Link>
            <Link
              href="/register"
              className="btn-success px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 min-w-[200px] flex items-center justify-center gap-3"
            >
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
                I Need Services
              </Link>
              <Link
                href="/register?role=vendor"
                className="btn-success px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 min-w-[200px] flex items-center justify-center gap-3"
              >
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