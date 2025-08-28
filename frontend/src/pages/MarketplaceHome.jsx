import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.jsx';
import { useApp } from '../contexts/AppContext.jsx';

const MarketplaceHome = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setLoading, setError, addNotification } = useApp();
  const navigate = useNavigate();

  // Predefined categories for display
  const defaultCategories = [
    {
      name: 'Photography',
      description: 'Professional photography services for events, portraits, and commercial needs',
      slug: 'photography',
      icon: '📸'
    },
    {
      name: 'Videography',
      description: 'Video production and filming services for events, marketing, and entertainment',
      slug: 'videography',
      icon: '🎥'
    },
    {
      name: 'Event Management',
      description: 'Complete event planning and coordination services for all types of occasions',
      slug: 'event-management',
      icon: '🎉'
    },
    {
      name: 'Wedding Planning',
      description: 'Specialized wedding planning and coordination services',
      slug: 'wedding-planning',
      icon: '💒'
    },
    {
      name: 'Catering',
      description: 'Food and beverage services for events and special occasions',
      slug: 'catering',
      icon: '🍽️'
    },
    {
      name: 'DJ Services',
      description: 'Music and entertainment services for parties and events',
      slug: 'dj-services',
      icon: '🎵'
    }
  ];

  useEffect(() => {
    loadFeaturedServices();
    setCategories(defaultCategories);
  }, []);

  const loadFeaturedServices = async () => {
    try {
      setLoading(true);
      const response = await apiService.services.getAll({ 
        featured: true, 
        limit: 6,
        status: 'active'
      });
      setFeaturedServices(response.data.services || []);
    } catch (error) {
      console.error('Error loading featured services:', error);
      // Don't show error for featured services as it's not critical
      setFeaturedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/services?category=${categorySlug}`);
  };

  return (
    <div className="marketplace-home">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Perfect Service Providers
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connect with professional photographers, videographers, event managers, and more
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search for services, vendors, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Service Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.slug}
                onClick={() => handleCategoryClick(category.slug)}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                <div className="mt-4">
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Explore {category.name} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Services</h2>
              <Link 
                to="/services" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Services →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {service.images && service.images.length > 0 && (
                    <img
                      src={service.images[0].url}
                      alt={service.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                      <span className="text-lg font-bold text-green-600">
                        ${service.base_price}
                        {service.pricing_type === 'hourly' && '/hr'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {service.rating || '5.0'} ({service.reviews_count || 0} reviews)
                        </span>
                      </div>
                      <Link
                        to={`/vendors/${service.vendor_profile_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="text-center bg-gray-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who found their perfect service providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Services
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Become a Vendor
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketplaceHome;