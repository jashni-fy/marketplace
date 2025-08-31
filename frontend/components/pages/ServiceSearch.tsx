'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '../../lib/api';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  pricing_type: string;
  vendor_profile: {
    business_name: string;
    location: string;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="service-search">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Services</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="photography">Photography</option>
              <option value="videography">Videography</option>
              <option value="event-management">Event Management</option>
              <option value="catering">Catering</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  ${service.base_price}
                  {service.pricing_type === 'hourly' && '/hr'}
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No services found. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;