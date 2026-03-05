'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '../ui/badge';
import { apiService } from '../../lib/api';
import { ShieldCheck, Star, Clock, MessageSquare, Award, ThumbsUp, MapPin, IndianRupee, Link as LinkIcon, Phone } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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

  const loadVendorData = useCallback(async () => {
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
  }, [params.id]);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
        <div className="text-center max-w-md p-8 border border-white/5 rounded-2xl bg-[#16191e]">
          <h1 className="text-xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-slate-400 text-sm">{error || 'The professional you are looking for does not exist.'}</p>
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
            size={12}
            className={star <= Math.round(rating) ? "fill-primary text-primary" : "text-slate-600"}
          />
        ))}
      </div>
    );
  };

  const isVerified = vendor.verification_status === 'verified' || vendor.is_verified;

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans pb-20">
      {/* Cover Banner (Abstract) */}
      <div className="h-48 w-full bg-gradient-to-r from-primary/10 to-[#16191e] border-b border-white/[0.03] relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="container mx-auto px-6 max-w-5xl -mt-16 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-[#16191e] p-8 rounded-2xl border border-white/[0.05] shadow-2xl mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-20 rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20 shrink-0">
                 {vendor.business_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{vendor.business_name}</h1>
                  {isVerified && (
                    <div className="bg-primary/20 text-primary rounded-full p-1 border border-primary/30" title="Verified Professional">
                      <ShieldCheck size={16} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5 text-white">
                    <Star className="size-3.5 fill-primary text-primary" /> {vendor.average_rating} ({vendor.total_reviews} reviews)
                  </span>
                  <span className="hidden sm:inline">&bull;</span>
                  <span>{vendor.years_experience} YRS EXP</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{vendor.description}</p>

            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 pt-2">
              <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {vendor.location}</span>
              {vendor.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {vendor.phone}</span>}
              {vendor.website && (
                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <LinkIcon className="size-3.5" /> Website
                </a>
              )}
            </div>
          </div>

          <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
            <Button className="w-full font-bold h-12 shadow-lg shadow-primary/20">
              Request Booking
            </Button>
            <Button variant="outline" className="w-full font-bold h-12 border-white/[0.05] hover:bg-white/[0.02]">
              Message
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/[0.05] mb-8 overflow-x-auto hide-scrollbar">
           {[
            { id: 'services', label: 'Services', count: services.length },
            { id: 'portfolio', label: 'Portfolio', count: portfolio.length },
            { id: 'reviews', label: 'Reviews', count: vendor.total_reviews }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
              }`}
            >
              {tab.label} <span className="opacity-50 ml-1">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.length > 0 ? services.map((service) => (
                <div key={service.id} className="group p-5 rounded-xl border border-white/[0.03] bg-[#16191e] hover:border-primary/30 transition-all flex flex-col cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{service.name}</h3>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-widest bg-white/[0.02] text-slate-400 border-white/[0.05]">{service.category.name}</Badge>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-5 leading-relaxed flex-1">{service.description}</p>
                  <div className="flex items-center justify-between border-t border-white/[0.03] pt-4 mt-auto">
                    <div className="flex items-center gap-1.5 text-white font-bold">
                       <IndianRupee className="size-3.5 text-primary" />
                       <span>{service.formatted_price}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Details &rarr;</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center border border-dashed border-white/[0.05] rounded-xl">
                   <p className="text-slate-500 text-sm font-medium">No services listed yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {portfolio.length > 0 ? portfolio.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden border border-white/[0.03] bg-[#16191e] cursor-pointer">
                  {item.primary_image_url ? (
                    <Image
                      src={item.primary_image_url}
                      alt={item.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{item.image_count} photos</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center border border-dashed border-white/[0.05] rounded-xl">
                   <p className="text-slate-500 text-sm font-medium">No portfolio work added yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {reviews.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Quality', val: 4.9 },
                      { label: 'Communication', val: 4.8 },
                      { label: 'Value', val: 4.7 },
                      { label: 'Punctuality', val: 5.0 }
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 rounded-xl border border-white/[0.03] bg-[#16191e] text-center">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-white">{stat.val.toFixed(1)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e]">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-sm text-white">{review.customer.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-white/[0.05] text-slate-400">
                               {review.service.name}
                             </Badge>
                             <div className="flex items-center gap-1 bg-white/[0.02] px-2 py-1 rounded border border-white/[0.02]">
                                <Star size={10} className="fill-primary text-primary" />
                                <span className="text-[10px] font-bold text-white">{review.rating.toFixed(1)}</span>
                             </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm font-light leading-relaxed">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center border border-dashed border-white/[0.05] rounded-xl">
                  <Star className="size-8 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-500 text-sm font-medium">Be the first to review this professional.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
