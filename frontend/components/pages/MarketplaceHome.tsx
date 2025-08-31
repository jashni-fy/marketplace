'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MarketplaceHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { name: 'Photography', icon: '📷', count: '1,200+', price: '$150-800' },
    { name: 'Videography', icon: '🎬', count: '850+', price: '$500-2500' },
    { name: 'Event Management', icon: '🎉', count: '650+', price: '$1000-5000' },
    { name: 'Catering', icon: '🍽️', count: '420+', price: '$25-100/person' },
    { name: 'Music & DJ', icon: '🎵', count: '380+', price: '$300-1500' },
    { name: 'Decoration', icon: '🎨', count: '290+', price: '$200-2000' }
  ];

  const featuredProviders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      specialty: 'Wedding Photography',
      rating: 4.9,
      reviews: 127,
      price: 'From $800',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Marcus Chen',
      specialty: 'Corporate Videography',
      rating: 4.8,
      reviews: 89,
      price: 'From $1,200',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      specialty: 'Event Planning',
      rating: 4.9,
      reviews: 156,
      price: 'From $2,500',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=400&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="hero py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6">
            Find Creative Professionals for Your Perfect Event
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Connect with top-rated photographers, videographers, and event managers who bring your vision to life
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-3 p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
              <input 
                type="text" 
                placeholder="Search for services..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name.toLowerCase()}>{cat.name}</option>
                ))}
              </select>
              <button className="btn-primary px-8 py-3 rounded-lg font-medium">
                Search
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-indigo-400 mb-1">2,700+</div>
              <div className="text-slate-400 text-sm">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">15,000+</div>
              <div className="text-slate-400 text-sm">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">98%</div>
              <div className="text-slate-400 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="services py-20 bg-slate-800/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-50 text-center mb-12">Our Services</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="service-card bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-indigo-500 transition-all duration-300 group">
                <div className="text-6xl mb-6 text-center">{category.icon}</div>
                <h3 className="text-xl font-bold text-slate-50 mb-3 text-center">{category.name}</h3>
                <p className="text-slate-300 text-center mb-6">Professional {category.name.toLowerCase()} services</p>
                
                <div className="flex justify-between items-center mb-6 text-sm">
                  <div className="text-indigo-400 font-semibold">{category.price}</div>
                  <div className="text-slate-400">{category.count} professionals</div>
                </div>
                
                <button className="btn-primary w-full py-3 rounded-lg font-medium">
                  Browse {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="featured-providers py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-50 text-center mb-12">Featured Professionals</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProviders.map((provider) => (
              <div key={provider.id} className="provider-card bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all duration-300 group">
                <div className="relative h-48">
                  <img
                    src={provider.portfolio}
                    alt={provider.specialty}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {provider.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-50 group-hover:text-indigo-400 transition-colors">
                        {provider.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{provider.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-400 mr-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm ml-1">{provider.rating}</span>
                      </div>
                      <span className="text-sm text-slate-400">({provider.reviews} reviews)</span>
                    </div>
                    
                    <Link
                      href={`/marketplace/provider/${provider.id}`}
                      className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta py-20 bg-slate-800/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-slate-300 mb-8">Join thousands of satisfied customers and vendors</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register?role=customer"
                className="btn-primary px-8 py-4 rounded-lg font-medium text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                I Need Services
              </Link>
              <Link
                href="/register?role=vendor"
                className="btn-secondary px-8 py-4 rounded-lg font-medium text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                I Provide Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketplaceHome;