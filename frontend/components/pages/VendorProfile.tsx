'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../../lib/api';

interface VendorProfileProps {
  params: {
    id: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  formatted_price: string;
  pricing_type: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  has_images: boolean;
  primary_image_url?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  is_featured: boolean;
  image_count: number;
  images: Array<{
    id: string;
    filename: string;
    url: string;
    thumbnail_url: string;
    medium_url: string;
  }>;
  primary_image_url?: string;
}

interface Vendor {
  id: string;
  business_name: string;
  description: string;
  location: string;
  phone?: string;
  website?: string;
  service_categories: string[];
  business_license?: string;
  years_experience: number;
  average_rating: string;
  total_reviews: number;
  is_verified: boolean;
  profile_complete: boolean;
  services_count: number;
  portfolio_items_count: number;
  featured_portfolio: PortfolioItem[];
  portfolio_categories: string[];
  coordinates: {
    latitude?: number;
    longitude?: number;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const VendorProfile: React.FC<VendorProfileProps> = ({ params }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

  useEffect(() => {
    loadVendorData();
  }, [params.id]);

  const loadVendorData = async () => {
    try {
      setLoading(true);

      // Load vendor profile
      const vendorResponse = await apiService.vendors.getById(params.id);
      setVendor(vendorResponse.data.vendor);

      // Load services
      const servicesResponse = await apiService.vendors.getServices(params.id);
      setServices(servicesResponse.data.services);

      // Load portfolio
      const portfolioResponse = await apiService.vendors.getPortfolio(params.id);
      setPortfolio(portfolioResponse.data.portfolio_items);

      // Load reviews
      const reviewsResponse = await apiService.vendors.getReviews(params.id);
      setReviews(reviewsResponse.data.reviews);

    } catch (err) {
      console.error('Error loading vendor data:', err);
      setError('Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600">{error || 'The vendor profile you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars: JSX.Element[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div className="vendor-profile">
      <div className="container mx-auto px-4 py-8">
        {/* Vendor Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <h1 className="text-3xl font-bold mr-4">{vendor.business_name}</h1>
                {vendor.is_verified && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {renderStars(parseFloat(vendor.average_rating))}
                  <span className="ml-2 text-gray-600">
                    {vendor.average_rating} ({vendor.total_reviews} reviews)
                  </span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="ml-2 text-gray-600">{vendor.years_experience} years experience</span>
              </div>

              <p className="text-gray-600 mb-4">{vendor.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {vendor.service_categories.map((category, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
                <span>📍 {vendor.location}</span>
                {vendor.phone && <span>📞 {vendor.phone}</span>}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    🌐 Website
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-0 md:ml-8">
              <button className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
                Contact Vendor
              </button>
            </div>
          </div>
        </div>

        {/* Featured Portfolio Preview */}
        {vendor.featured_portfolio.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-6">Featured Work</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {vendor.featured_portfolio.map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
                  {item.primary_image_url ? (
                    <img
                      src={item.primary_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Portfolio ({portfolio.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Reviews ({vendor.total_reviews})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                        {service.primary_image_url && (
                          <img
                            src={service.primary_image_url}
                            alt={service.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="mb-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {service.category.name}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {service.formatted_price}
                          </span>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No services available at the moment.</p>
                )}
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div>
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {item.primary_image_url ? (
                          <img
                            src={item.primary_image_url}
                            alt={item.title}
                            className="w-full h-64 object-cover"
                          />
                        ) : (
                          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                              {item.category}
                            </span>
                            {item.is_featured && (
                              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                          {item.image_count > 1 && (
                            <p className="text-xs text-gray-500 mt-2">+{item.image_count - 1} more images</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No portfolio items available.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="ml-2 font-medium">{review.customer_name}</span>
                          <span className="ml-2 text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No reviews yet.</p>
                    <p className="text-sm text-gray-500">Be the first to leave a review for this vendor!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;