import React from 'react';
import { Link } from 'react-router-dom';

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
              to="/marketplace"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Join as Vendor
            </Link>
          </div>
        </div>
      </header>
      
      <section className="features-section py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">1. Browse Services</h3>
              <p>Explore our marketplace to find the perfect service provider for your needs</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">2. Book & Connect</h3>
              <p>Send booking requests and communicate directly with service providers</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">3. Enjoy Your Event</h3>
              <p>Relax knowing you have professional service providers handling your event</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;