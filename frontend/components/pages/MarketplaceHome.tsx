'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Camera,
  Video,
  Music,
  Utensils,
  Palette,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Trophy,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const MarketplaceHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { name: 'Photography', icon: <Camera className="w-8 h-8" />, count: '1,200+', price: '$150-800', color: 'from-pink-500 to-rose-500' },
    { name: 'Videography', icon: <Video className="w-8 h-8" />, count: '850+', price: '$500-2500', color: 'from-violet-500 to-purple-500' },
    { name: 'Event Planning', icon: <Calendar className="w-8 h-8" />, count: '650+', price: '$1000-5000', color: 'from-blue-500 to-cyan-500' },
    { name: 'Catering', icon: <Utensils className="w-8 h-8" />, count: '420+', price: '$25-100/person', color: 'from-emerald-500 to-green-500' },
    { name: 'Music & DJ', icon: <Music className="w-8 h-8" />, count: '380+', price: '$300-1500', color: 'from-amber-500 to-orange-500' },
    { name: 'Decoration', icon: <Palette className="w-8 h-8" />, count: '290+', price: '$200-2000', color: 'from-teal-500 to-emerald-500' }
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
      portfolio: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
      verified: true
    },
    {
      id: 2,
      name: 'Marcus Chen',
      specialty: 'Corporate Videography',
      rating: 4.8,
      reviews: 89,
      price: 'From $1,200',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
      verified: true
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      specialty: 'Event Planning',
      rating: 4.9,
      reviews: 156,
      price: 'From $2,500',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      portfolio: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-50 font-sans selection:bg-violet-500/30">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
          </div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>The #1 Marketplace for Event Pros</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 mb-6 tracking-tight leading-tight">
            Find Creative Professionals <br className="hidden md:block" />
            for Your Perfect Event
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with top-rated photographers, videographers, and event managers who bring your vision to life.
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto mb-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col md:flex-row gap-2 p-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex-1 flex items-center px-4 relative">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 py-3 text-base"
                />
              </div>

              <div className="h-px md:h-12 w-full md:w-px bg-slate-700/50 my-auto"></div>

              <div className="flex-1 flex items-center px-4 relative">
                <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent border-none text-slate-200 focus:outline-none focus:ring-0 py-3 text-base appearance-none cursor-pointer pr-8"
                >
                  <option value="" className="bg-slate-900 text-slate-400">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name.toLowerCase()} className="bg-slate-900">{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 pointer-events-none" />
              </div>

              <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transform hover:scale-[1.02] md:w-auto w-full">
                Search
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-slate-800/50">
            {[
              { label: 'Professionals', value: '2,700+', icon: Users, color: 'text-indigo-400' },
              { label: 'Completed Projects', value: '15k+', icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Satisfaction Rate', value: '98%', icon: Trophy, color: 'text-amber-400' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                </div>
                <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-24 bg-slate-900/50 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Services</h2>
            <p className="text-slate-400">Everything you need for your special occasion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group relative bg-slate-800/20 hover:bg-slate-800/40 backdrop-blur-sm border border-slate-800 hover:border-slate-600 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{category.count} professionals</span>
                    <span className="text-indigo-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Browse <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Professionals</h2>
              <p className="text-slate-400">Top-rated vendors selected for you</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium transition-colors">
              View all providers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProviders.map((provider) => (
              <div key={provider.id} className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-10" />
                  <img
                    src={provider.portfolio}
                    alt={provider.specialty}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
                    {provider.price}
                  </div>
                </div>

                <div className="p-6 relative">
                  <div className="absolute -top-10 left-6 z-20">
                    <div className="relative">
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-xl"
                      />
                      {provider.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                      {provider.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">{provider.specialty}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-slate-200 font-medium">{provider.rating}</span>
                        <span className="text-slate-500 text-sm">({provider.reviews})</span>
                      </div>

                      <Link
                        href={`/marketplace/provider/${provider.id}`}
                        className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/search" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium">
              View all providers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-16 md:px-16 text-center">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to make your event unforgettable?
              </h2>
              <p className="text-lg text-violet-100 mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied active users. Whether you're planning a wedding or offering your services, we have a place for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register?role=customer"
                  className="w-full sm:w-auto bg-white text-violet-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-violet-50 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Find Services
                </Link>
                <Link
                  href="/register?role=vendor"
                  className="w-full sm:w-auto bg-violet-700/50 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-violet-700/70 transition-colors backdrop-blur-md flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Become a Vendor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketplaceHome;