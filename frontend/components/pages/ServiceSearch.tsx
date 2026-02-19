'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '../../lib/api';
import { ShieldCheck, Star, Search, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  formatted_price: string;
  pricing_type: string;
  vendor_profile: {
    id: string;
    business_name: string;
    location: string;
    average_rating: number;
    total_reviews: number;
    verification_status: string;
  };
  category: {
    name: string;
  };
}

const ServiceSearch = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || '';
    
    setSearchQuery(initialSearch);
    setSelectedCategory(initialCategory);
    
    loadServices({ search: initialSearch, category: initialCategory });
  }, [searchParams]);

  const loadServices = async (filters: { search?: string; category?: string } = {}) => {
    try {
      setLoading(true);
      const response = await apiService.services.search({
        q: filters.search || searchQuery,
        category: filters.category || selectedCategory,
        status: 'active'
      });
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extralight tracking-tight text-slate-900">Find Professionals</h1>
            <p className="text-slate-500 font-light">Discover and book the best talent for your next event.</p>
          </div>
        </div>
        
        {/* Search Form */}
        <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm mb-12 max-w-4xl">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 gap-3">
              <Search className="size-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, service or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 bg-transparent focus:outline-none font-light text-slate-900"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-slate-100 self-center" />
            <div className="px-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-transparent focus:outline-none font-light text-slate-600 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="event-management">Event Management</option>
                <option value="catering">Catering</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all font-normal"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-500 flex flex-col">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-none hover:bg-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
                        {service.category.name}
                      </Badge>
                    </div>
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-light">
                      No Preview Image
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                            {service.vendor_profile.business_name}
                          </p>
                          {service.vendor_profile.verification_status === 'verified' && (
                            <ShieldCheck size={14} className="text-blue-500 fill-blue-50" />
                          )}
                        </div>
                        <h3 className="text-xl font-normal text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {service.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{service.vendor_profile.average_rating || '5.0'}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 font-light text-sm line-clamp-2 mb-6 flex-1">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">Starting from</p>
                        <span className="text-xl font-light text-slate-900">
                          {service.formatted_price}
                        </span>
                      </div>
                      <Link 
                        href={`/photographer/${service.vendor_profile.id}`}
                        className="bg-slate-50 text-slate-900 px-6 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition-all text-sm font-normal"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto">
                <Search className="size-12 mx-auto mb-4 text-slate-200" strokeWidth={1} />
                <p className="text-slate-500 font-light italic">No professionals match your search. Try different keywords.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;
