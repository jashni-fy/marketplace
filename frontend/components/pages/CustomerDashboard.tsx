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
import { 
  Calendar as CalendarIcon, 
  Heart, 
  ShoppingBag, 
  Clock, 
  Star, 
  MapPin, 
  ArrowRight,
  User,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Upcoming', value: '0', icon: CalendarIcon },
    { label: 'Favorites', value: '0', icon: Heart },
    { label: 'Total Spent', value: '₹0', icon: ShoppingBag },
  ];

  const renderOverview = () => (
    <div className="space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm group hover:border-foreground transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-light mb-1">{stat.label}</p>
                  <p className="text-3xl font-light tracking-tight">{stat.value}</p>
                </div>
                <div className="p-3 rounded-2xl bg-secondary group-hover:bg-foreground group-hover:text-white transition-colors">
                  <stat.icon className="size-5" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-light tracking-tight">Recent Activity</h3>
          </div>

          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="p-16 text-center">
              <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="size-8 text-muted-foreground opacity-40" strokeWidth={1} />
              </div>
              <h4 className="text-xl font-light mb-2">No bookings yet</h4>
              <p className="text-muted-foreground font-light mb-8 max-w-xs mx-auto">
                Find the perfect photographer for your next special occasion.
              </p>
              <Link href="/marketplace">
                <Button className="rounded-full px-8 font-normal text-white">
                  Explore Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <h3 className="text-2xl font-light tracking-tight">Profile</h3>
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="size-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-normal">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground font-light capitalize">{user?.role}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start font-light rounded-xl hover:bg-secondary">
                  <Settings className="mr-2 size-4" strokeWidth={1.5} />
                  Account Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start font-light rounded-xl hover:bg-secondary">
                  <Heart className="mr-2 size-4" strokeWidth={1.5} />
                  My Favorites
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-foreground text-white overflow-hidden relative">
            <CardContent className="p-6 relative z-10">
              <h4 className="text-xl font-light mb-2">Want to earn?</h4>
              <p className="text-white/70 text-sm font-light mb-6">
                Switch to a photographer account and start showcasing your portfolio.
              </p>
              <Button variant="outline" className="w-full rounded-full border-white/20 hover:bg-white hover:text-black transition-colors font-normal">
                Become a Partner
              </Button>
            </CardContent>
            <div className="absolute top-0 right-0 size-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-2">Dashboard</h1>
          <p className="text-xl text-muted-foreground font-light">Hello, {user?.first_name || 'Guest'}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <Skeleton className="lg:col-span-2 h-[400px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {renderOverview()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomerDashboard;
