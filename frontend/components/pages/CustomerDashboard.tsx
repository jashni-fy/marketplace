'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ReviewFormModal } from '@/components/ReviewFormModal';
import {
  Calendar as CalendarIcon,
  Heart,
  ShoppingBag,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  User,
  Settings,
  Bell,
  Search,
  LogOut,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.bookings.getAll({ status: 'completed' });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Completed Bookings', value: bookings.length.toString(), icon: CalendarIcon, trend: 'Lifetime' },
    { label: 'Saved Pros', value: '0', icon: Heart, trend: 'Explore now' },
    { label: 'Total Spent', value: bookings.length > 0 ? '₹' + bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString() : '₹0', icon: ShoppingBag, trend: 'Lifetime' },
  ];

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] hover:border-primary/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
              <stat.icon className="size-4 text-slate-600 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex items-end justify-between">
              <h4 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Completed Bookings</h3>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-white/[0.03] rounded-xl">
                <div className="size-12 rounded-full bg-secondary flex items-center justify-center mb-4 opacity-30">
                  <ShoppingBag className="size-5 text-slate-400" strokeWidth={2} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">No completed bookings yet</h4>
                <p className="text-xs text-slate-500 mb-6 max-w-xs">
                  Find the perfect photographer for your next special occasion.
                </p>
                <Link href="/marketplace">
                  <Button size="sm" className="rounded-lg font-bold text-xs">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-white/[0.03] bg-[#0f1115] hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-1">{booking.service?.name}</h4>
                        <p className="text-xs text-slate-400 mb-2">{booking.vendor?.business_name}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <CalendarIcon className="size-3" />
                            {new Date(booking.event_date).toLocaleDateString()}
                          </span>
                          <span className="text-sm font-bold text-white">₹{booking.total_amount?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                          Completed
                        </Badge>

                        {booking.review ? (
                          <Badge variant="outline" className="bg-slate-500/10 border-slate-500/30 text-slate-400">
                            <Star className="size-3 fill-current mr-1" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBookingForReview(booking);
                              setReviewModalOpen(true);
                            }}
                            className="text-xs"
                          >
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e]">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Quick Links</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Heart size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">Saved Professionals</span>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <Settings size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">Account Settings</span>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/10 border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
               <Camera className="size-8 text-primary mb-3" />
               <h4 className="text-base font-bold text-white mb-2">Are you a professional?</h4>
               <p className="text-xs text-slate-400 font-light mb-5">Switch to a vendor account to list your services and start earning.</p>
               <Button size="sm" className="w-full bg-white text-black font-bold rounded-lg h-9 hover:bg-slate-200">Become a Partner</Button>
            </div>
            <div className="absolute -bottom-10 -right-10 size-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans">
      <Header />

      <ReviewFormModal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedBookingForReview(null);
        }}
        onSuccess={() => {
          fetchCompletedBookings();
        }}
        bookingId={selectedBookingForReview?.id || 0}
        vendorName={selectedBookingForReview?.vendor?.business_name || ''}
        serviceName={selectedBookingForReview?.service?.name || ''}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-[1.5rem] bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-xl shadow-primary/20">
               <span className="text-xl font-bold">{user?.first_name?.[0] || 'C'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                Dashboard
              </h1>
              <p className="text-sm text-slate-400">Welcome back, <span className="text-white font-medium">{user?.first_name || 'Guest'}</span></p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl bg-white/[0.02]" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-[300px] w-full rounded-2xl bg-white/[0.02]" />
                <Skeleton className="h-[300px] w-full rounded-2xl bg-white/[0.02]" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {renderOverview()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-9-6" />
    </svg>
  );
}

export default CustomerDashboard;
