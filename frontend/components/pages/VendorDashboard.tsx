'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import ServiceManagement from '../ServiceManagement';
import PortfolioManager from '../PortfolioManager';
import BookingCalendar from '../BookingCalendar';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Briefcase, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  status: string;
  formatted_price: string;
}

interface Booking {
  id: string;
  service_name: string;
  event_date: string;
  status: string;
  total_amount?: number;
}

interface DashboardMetrics {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

interface DashboardData {
  services: Service[];
  bookings: Booking[];
  metrics: DashboardMetrics;
}

const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    services: [],
    bookings: [],
    metrics: {
      totalServices: 0,
      activeServices: 0,
      totalBookings: 0,
      pendingBookings: 0,
      completedBookings: 0,
      totalRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const servicesResponse = await apiService.services.getAll();
      const services = servicesResponse.data.services || [];
      const bookings: Booking[] = []; // Placeholder until booking API is implemented

      const metrics: DashboardMetrics = {
        totalServices: services.length,
        activeServices: services.filter((s: Service) => s.status === 'active').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalRevenue: bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_amount || 0), 0)
      };

      setDashboardData({ services, bookings, metrics });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = () => {
    loadDashboardData();
  };

  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Services', value: dashboardData.metrics.totalServices, icon: Briefcase, color: 'text-blue-500' },
          { label: 'Active Status', value: dashboardData.metrics.activeServices, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Total Bookings', value: dashboardData.metrics.totalBookings, icon: CalendarIcon, color: 'text-purple-500' },
          { label: 'Total Revenue', value: `₹${dashboardData.metrics.totalRevenue}`, icon: DollarSign, color: 'text-emerald-500' },
        ].map((item, index) => (
          <Card key={index} className="border-border shadow-sm overflow-hidden group hover:border-foreground transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-light mb-1">{item.label}</p>
                  <p className="text-3xl font-light tracking-tight">{item.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-secondary group-hover:bg-foreground group-hover:text-white transition-colors`}>
                  <item.icon className="size-5" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Services */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-light tracking-tight">Recent Services</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('services')} className="font-light rounded-full">
              View All
            </Button>
          </div>
          
          {dashboardData.services.length > 0 ? (
            <div className="grid gap-4">
              {dashboardData.services.slice(0, 4).map((service) => (
                <Card key={service.id} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Briefcase className="size-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-normal text-lg">{service.name}</p>
                        <p className="text-sm text-muted-foreground font-light">{service.formatted_price}</p>
                      </div>
                    </div>
                    <Badge variant={service.status === 'active' ? 'secondary' : 'outline'} className="rounded-full font-normal">
                      {service.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground font-light mb-4">No services created yet</p>
                <Button onClick={() => setActiveTab('services')} className="rounded-full font-normal">
                  <Plus className="mr-2 size-4" /> Create Service
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Activity Feed / Pending */}
        <div className="space-y-6">
          <h3 className="text-2xl font-light tracking-tight">Recent Activity</h3>
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              {dashboardData.metrics.pendingBookings > 0 ? (
                <div className="space-y-6">
                  {dashboardData.bookings
                    .filter(b => b.status === 'pending')
                    .slice(0, 5)
                    .map((booking) => (
                      <div key={booking.id} className="flex gap-4">
                        <div className="size-2 mt-2 rounded-full bg-orange-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-normal">New booking request for {booking.service_name}</p>
                          <p className="text-xs text-muted-foreground font-light">{booking.event_date}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Clock className="size-8 mx-auto mb-3 text-muted-foreground opacity-20" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground font-light">No recent notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-2">Dashboard</h1>
            <p className="text-xl text-muted-foreground font-light">Welcome back, {user?.first_name || 'Partner'}</p>
          </div>
          
          <div className="flex bg-secondary p-1 rounded-full overflow-hidden">
            {[
              { id: 'overview', name: 'Overview', icon: LayoutDashboard },
              { id: 'services', name: 'Services', icon: Briefcase },
              { id: 'portfolio', name: 'Portfolio', icon: ImageIcon },
              { id: 'calendar', name: 'Calendar', icon: CalendarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-normal transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-foreground text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="size-4" strokeWidth={1.5} />
                <span className={activeTab === tab.id ? 'block' : 'hidden lg:block'}>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 text-destructive text-sm font-light flex items-center gap-2">
                <Clock className="size-4" /> {error}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Skeleton className="lg:col-span-2 h-[400px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'services' && (
                <ServiceManagement 
                  services={dashboardData.services}
                  onServiceUpdate={handleServiceUpdate}
                />
              )}
              {activeTab === 'portfolio' && <PortfolioManager />}
              {activeTab === 'calendar' && <BookingCalendar bookings={dashboardData.bookings} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VendorDashboard;
