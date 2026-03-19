'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { apiService } from '../../lib/api';
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  Award, 
  ThumbsUp, 
  MapPin, 
  IndianRupee, 
  Link as LinkIcon, 
  Phone,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Info,
  Zap,
  ArrowLeft,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  formatted_price: string;
  category: { name: string };
}

const VendorProfile = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');
  
  const isOwner = user?.id === vendor?.user?.id;

  // Interactive Booking State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [addons, setAddons] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState('');

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
      
      // Fetch advanced rating stats via GraphQL
      const gqlQuery = `
        query GetVendorRatingStats($id: ID!) {
          vendorProfile(id: $id) {
            ratingDisplay
            ratingBreakdown {
              quality
              communication
              value
              punctuality
            }
            ratingDistribution {
              fiveStar
              fourStar
              threeStar
              twoStar
              oneStar
            }
          }
        }
      `;
      const gqlRes = await apiService.graphql(gqlQuery, { id: params.id });
      if (gqlRes.data?.data?.vendorProfile) {
        setRatingStats(gqlRes.data.data.vendorProfile);
      }
      
      if (servicesRes.data.services?.length > 0) {
        setSelectedService(servicesRes.data.services[0]);
      }
    } catch (err) {
      console.error('Error loading vendor data:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  const handleRequestVerification = async () => {
    try {
      setVerificationLoading(true);
      await apiService.profiles.requestVerification();
      toast.success('Verification request submitted successfully');
      loadVendorData(); // Reload to get updated status
    } catch (err: any) {
      toast.error(err.extractedMessage || 'Failed to request verification');
    } finally {
      setVerificationLoading(false);
    }
  };

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;
    const base = selectedService.base_price || 0;
    const addonPrice = addons.length * 5000; // Mock addon price
    return base + addonPrice;
  }, [selectedService, addons]);

  const toggleAddon = (id: string) => {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleBookingRequest = () => {
    if (!bookingDate) {
      toast.error('Please select a date first');
      return;
    }
    toast.success('Requesting booking for ' + bookingDate);
    router.push(`/booking/${selectedService?.id}?date=${bookingDate}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
    </div>
  );

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans pb-20">
      {/* Dynamic Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1115]/80 backdrop-blur-md border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              <ArrowLeft className="size-4" /> Back
           </button>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-white uppercase tracking-widest">{vendor.business_name}</span>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1">
                 <Star className="size-3 fill-primary text-primary" />
                 <span className="text-xs font-bold text-white">{vendor.average_rating}</span>
              </div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Content Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Minimal Pro Header */}
            <section className="space-y-6">
               <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight">{vendor.business_name}</h1>
                    
                    {/* Verification Status Banner for Owner */}
                    {isOwner && vendor.verification_status !== 'verified' && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="size-5 text-primary" />
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">Profile Verification</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {vendor.verification_status === 'pending_verification' 
                                ? 'Your request is currently under review by our team.' 
                                : 'Get verified to build trust and increase your visibility in the marketplace.'}
                            </p>
                          </div>
                        </div>
                        {vendor.verification_status === 'unverified' && (
                          <Button 
                            size="sm" 
                            disabled={verificationLoading}
                            onClick={handleRequestVerification}
                            className="bg-primary text-white font-bold text-[10px] uppercase tracking-widest px-4 h-9"
                          >
                            {verificationLoading ? 'Requesting...' : 'Request Now'}
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                       <span className="flex items-center gap-1.5 text-slate-300"><MapPin className="size-3.5 text-primary" /> {vendor.location}</span>
                       <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-primary" /> Usually responds in 2h</span>
                       {vendor.is_verified && (
                         <span className="flex items-center gap-1.5 text-primary border border-primary/30 px-2 py-0.5 rounded-full bg-primary/5">
                           <ShieldCheck className="size-3.5" /> Verified Pro
                         </span>
                       )}
                    </div>
                  </div>
               </div>
               <p className="text-slate-400 text-lg font-light leading-relaxed max-w-3xl">
                 {vendor.description}
               </p>
            </section>

            {/* Visual Portfolio Preview */}
            <section>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Selected Works</h2>
                  <button onClick={() => setActiveTab('portfolio')} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All Gallery</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {portfolio.slice(0, 6).map((item, i) => (
                    <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/[0.05] bg-[#16191e] group cursor-pointer">
                       <Image src={item.primary_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e'} alt="work" fill className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0" unoptimized />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
               </div>
            </section>

            {/* Services Detail List */}
            <section className="space-y-6">
               <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Available Packages</h2>
               <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service.id} 
                      onClick={() => setSelectedService(service)}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row justify-between gap-6 ${
                        selectedService?.id === service.id ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/40' : 'bg-[#16191e] border-white/[0.03] hover:border-white/10'
                      }`}
                    >
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <h3 className="font-bold text-white">{service.name}</h3>
                             {selectedService?.id === service.id && <div className="size-5 rounded-full bg-primary flex items-center justify-center"><Check className="size-3 text-primary-foreground" strokeWidth={4} /></div>}
                          </div>
                          <p className="text-sm text-slate-400 font-light max-w-md">{service.description}</p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Starting at</p>
                          <p className="text-2xl font-bold text-white">₹{service.base_price?.toLocaleString()}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Reviews Summary */}
            <section className="p-8 rounded-[2rem] border border-white/[0.03] bg-[#16191e]">
               {reviews.length > 0 ? (
                  <>
                     <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 pb-10 border-b border-white/[0.03]">
                        <div className="flex flex-col md:flex-row gap-8">
                           <div>
                              <h2 className="text-4xl font-bold text-white mb-2">{vendor.average_rating || 'N/A'}</h2>
                              <div className="flex gap-1 mb-2">
                                 {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                       key={i}
                                       className={`size-4 ${i <= Math.round(vendor.average_rating || 0) ? 'fill-primary text-primary' : 'text-slate-600'}`}
                                    />
                                 ))}
                              </div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                 {ratingStats?.ratingDisplay || `Based on ${vendor.total_reviews} reviews`}
                              </p>
                           </div>

                           {/* Star Distribution */}
                           {ratingStats?.ratingDistribution && (
                              <div className="flex-1 max-w-xs space-y-1">
                                 {[
                                    { label: '5 star', count: ratingStats.ratingDistribution.fiveStar },
                                    { label: '4 star', count: ratingStats.ratingDistribution.fourStar },
                                    { label: '3 star', count: ratingStats.ratingDistribution.threeStar },
                                    { label: '2 star', count: ratingStats.ratingDistribution.twoStar },
                                    { label: '1 star', count: ratingStats.ratingDistribution.oneStar },
                                 ].map((item) => {
                                    const percentage = vendor.total_reviews > 0 
                                       ? (item.count / vendor.total_reviews) * 100 
                                       : 0;
                                    return (
                                       <div key={item.label} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                                          <span className="w-10 shrink-0">{item.label}</span>
                                          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                             <div className="h-full bg-primary/60" style={{ width: `${percentage}%` }} />
                                          </div>
                                          <span className="w-4 text-right text-slate-400">{item.count}</span>
                                       </div>
                                    );
                                 })}
                              </div>
                           )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                           {[
                              { label: 'Quality', key: 'quality' },
                              { label: 'Communication', key: 'communication' },
                              { label: 'Value', key: 'value' },
                              { label: 'Punctuality', key: 'punctuality' },
                           ].map(({ label, key }) => {
                              const avg = ratingStats?.ratingBreakdown?.[key] || 
                                 (reviews.length > 0
                                    ? (reviews.reduce((sum, r) => sum + (r[`${key}_rating`] || 0), 0) / reviews.length).toFixed(1)
                                    : 'N/A');
                              const percentage = avg !== 'N/A' ? Math.round((parseFloat(avg as string) / 5) * 100) : 0;
                              return (
                                 <div key={label} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                       <span>{label}</span>
                                       <span className="text-white">{avg}</span>
                                    </div>
                                    <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                                       <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="space-y-6">
                        {reviews.slice(0, 3).map((review, i) => (
                           <div key={i} className="space-y-3">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-sm font-bold text-white">{review.customer?.name || 'Verified Client'}</p>
                                    <div className="flex gap-1 mt-1">
                                       {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                             key={star}
                                             className={`size-3 ${star <= review.rating ? 'fill-primary text-primary' : 'text-slate-600'}`}
                                          />
                                       ))}
                                    </div>
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                    {new Date(review.created_at).toLocaleDateString()}
                                 </span>
                              </div>
                              {review.comment && (
                                 <p className="text-sm text-slate-400 font-light italic leading-relaxed">"{review.comment}"</p>
                              )}
                           </div>
                        ))}
                     </div>
                  </>
               ) : (
                  <div className="text-center py-8">
                     <p className="text-slate-400">No reviews yet. Be the first to review this professional!</p>
                  </div>
               )}
            </section>
          </div>

          {/* Sticky Interactive Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
               <Card className="border border-primary/20 bg-[#1a1d23] shadow-3xl shadow-primary/5 overflow-hidden">
                  <div className="p-6 bg-primary/10 border-b border-primary/10">
                     <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="size-4" fill="currentColor" /> Quick Booking
                     </h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                     {/* Step 1: Date */}
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                           <CalendarIcon className="size-3" /> Select Event Date
                        </label>
                        <input 
                          type="date" 
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-[#0f1115] border border-white/[0.05] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark] text-sm font-bold" 
                        />
                     </div>

                     {/* Step 2: Package Summary */}
                     <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Package</p>
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-white">{selectedService?.name}</span>
                           <span className="text-sm font-bold text-white">₹{selectedService?.base_price?.toLocaleString()}</span>
                        </div>
                     </div>

                     {/* Step 3: Addons (The Value Add) */}
                     <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Popular Add-ons</p>
                        <div className="space-y-2">
                           {[
                             { id: 'exp', label: 'Express 48h Delivery', price: '₹5,000' },
                             { id: 'raw', label: 'Raw Files Access', price: '₹5,000' },
                           ].map(addon => (
                             <button 
                                key={addon.id}
                                onClick={() => toggleAddon(addon.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-bold transition-all ${
                                  addons.includes(addon.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-[#0f1115] border-white/[0.05] text-slate-400 hover:border-white/20'
                                }`}
                             >
                                <span>{addon.label}</span>
                                <span>{addon.price}</span>
                             </button>
                           ))}
                        </div>
                     </div>

                     {/* Final Price & CTA */}
                     <div className="pt-6 border-t border-white/[0.05] space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Total</span>
                           <div className="text-right">
                              <span className="text-3xl font-bold text-white tracking-tighter flex items-center justify-end gap-1">
                                 <IndianRupee className="size-5 text-primary" strokeWidth={3} />
                                 {totalPrice.toLocaleString()}
                              </span>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Inclusive of platform fees</p>
                           </div>
                        </div>
                        
                        <Button 
                          onClick={handleBookingRequest}
                          className="w-full h-14 rounded-xl font-bold text-base shadow-xl shadow-primary/20 group"
                        >
                           Confirm Booking Request
                           <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        
                        <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                           <Info className="size-3" /> No payment required until professional accepts.
                        </p>
                     </div>
                  </CardContent>
               </Card>

               {/* Quick Info Card */}
               <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e] space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <ShieldCheck size={18} />
                     </div>
                     <p className="text-xs font-bold text-white">Jashnify Protected</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                     Your payment is held securely and only released after the professional delivers the service.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorProfile;
