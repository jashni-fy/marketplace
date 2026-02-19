'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../../lib/api';
import { ShieldCheck, Star, Clock, MessageSquare, Award, ThumbsUp } from 'lucide-react';

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

interface Review {
  id: string;
  rating: number;
  quality_rating?: number;
  communication_rating?: number;
  value_rating?: number;
  punctuality_rating?: number;
  comment: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  };
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
  verification_status: string;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

  useEffect(() => {
    loadVendorData();
  }, [params.id]);

  const loadVendorData = async () => {
    try {
      setLoading(true);

      const [vendorRes, servicesRes, portfolioRes, reviewsRes] = await Promise.all([
        apiService.vendors.getById(params.id),
        apiService.vendors.getServices(params.id),
        apiService.vendors.getPortfolio(params.id),
        apiService.vendors.getReviews(params.id)
      ]);

      setVendor(vendorRes.data.vendor);
      setServices(servicesRes.data.services);
      setPortfolio(portfolioRes.data.portfolio_items);
      setReviews(reviewsRes.data.reviews);

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
          <p className="text-gray-600 font-light">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 font-light">{error || 'The vendor profile you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const isVerified = vendor.verification_status === 'verified' || vendor.is_verified;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Vendor Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-extralight tracking-tight text-slate-900">{vendor.business_name}</h1>
                  {isVerified && (
                    <div className="bg-blue-500 text-white rounded-full p-1 shadow-sm" title="Verified Professional">
                      <ShieldCheck size={20} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    {renderStars(parseFloat(vendor.average_rating))}
                    <span className="text-sm font-normal">
                      {vendor.average_rating} ({vendor.total_reviews} reviews)
                    </span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm font-light">{vendor.years_experience} years experience</span>
                </div>
              </div>

              <p className="text-slate-600 font-light leading-relaxed max-w-3xl text-lg">{vendor.description}</p>

              <div className="flex flex-wrap gap-2">
                {vendor.service_categories.map((category, index) => (
                  <span key={index} className="bg-slate-100 text-slate-700 text-xs font-normal px-3 py-1.5 rounded-full border border-slate-200">
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-500 pt-2">
                <span className="flex items-center gap-1.5 font-light">📍 {vendor.location}</span>
                {vendor.phone && <span className="flex items-center gap-1.5 font-light">📞 {vendor.phone}</span>}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-normal transition-colors underline underline-offset-4">
                    🌐 Website
                  </a>
                )}
              </div>
            </div>

            <div className="md:w-64 space-y-4">
              <button className="w-full bg-slate-900 text-white py-4 rounded-full hover:bg-slate-800 font-normal transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Book Photographer
              </button>
              <button className="w-full bg-white text-slate-900 border border-slate-200 py-4 rounded-full hover:bg-slate-50 font-normal transition-all">
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100">
            <nav className="flex space-x-12 px-8">
              {[
                { id: 'services', label: 'Services', count: services.length },
                { id: 'portfolio', label: 'Portfolio', count: portfolio.length },
                { id: 'reviews', label: 'Reviews', count: vendor.total_reviews }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-6 px-1 border-b-2 font-normal text-sm transition-all relative ${activeTab === tab.id
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs opacity-60 font-light">({tab.count})</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.length > 0 ? services.map((service) => (
                  <div key={service.id} className="group border border-slate-100 p-6 rounded-2xl hover:border-slate-300 hover:shadow-xl transition-all duration-300">
                    <div className="mb-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        {service.category.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-normal mb-3 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                    <p className="text-slate-500 font-light text-sm line-clamp-3 mb-6 leading-relaxed">{service.description}</p>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Starting from</p>
                        <span className="text-2xl font-light text-slate-900">
                          {service.formatted_price}
                        </span>
                      </div>
                      <button className="bg-slate-50 text-slate-900 px-5 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition-all text-sm font-normal">
                        Details
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="col-span-full text-slate-400 text-center py-12 font-light italic">No services listed yet.</p>
                )}
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolio.length > 0 ? portfolio.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      {item.primary_image_url ? (
                        <img
                          src={item.primary_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">No images</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-normal text-slate-900">{item.title}</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-light">{item.image_count} photos</p>
                  </div>
                )) : (
                  <p className="col-span-full text-slate-400 text-center py-12 font-light italic">No portfolio work added yet.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-10 max-w-4xl mx-auto">
                {reviews.length > 0 ? (
                  <>
                    {/* Granular Breakdown (Simplified UI version) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-10">
                      {[
                        { label: 'Quality', icon: Award },
                        { label: 'Communication', icon: MessageSquare },
                        { label: 'Value', icon: ThumbsUp },
                        { label: 'Punctuality', icon: Clock }
                      ].map((stat) => (
                        <div key={stat.label} className="text-center space-y-1">
                          <stat.icon className="size-4 mx-auto text-slate-400" />
                          <p className="text-[10px] uppercase font-bold text-slate-500">{stat.label}</p>
                          <p className="text-sm font-normal">4.9/5</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-8 divide-y divide-slate-100">
                      {reviews.map((review) => (
                        <div key={review.id} className="pt-8 first:pt-0">
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <p className="font-normal text-slate-900">{review.customer.name}</p>
                              <div className="flex items-center gap-3">
                                {renderStars(review.rating)}
                                <span className="text-xs text-slate-400 font-light">
                                  {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-light rounded-full border-slate-200">
                              {review.service.name}
                            </Badge>
                          </div>
                          <p className="text-slate-600 font-light leading-relaxed italic">"{review.comment}"</p>
                          
                          {(review.quality_rating || review.communication_rating) && (
                            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                              {review.quality_rating && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Quality</span>
                                  <div className="flex gap-0.5">{renderStars(review.quality_rating)}</div>
                                </div>
                              )}
                              {review.communication_rating && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Comm.</span>
                                  <div className="flex gap-0.5">{renderStars(review.communication_rating)}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Star className="size-12 mx-auto mb-4 text-slate-200" strokeWidth={1} />
                    <p className="text-slate-500 font-light italic">Be the first to review this photographer!</p>
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
