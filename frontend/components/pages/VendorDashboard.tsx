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
  Plus,
  ShieldCheck,
  AlertCircle,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  status: string;
  formatted_price: string;
}

interface ActivityItem {
  type: 'booking' | 'review';
  id: string;
  customer: string;
  date: string;
  status?: string;
  amount?: number;
  rating?: number;
}

interface AnalyticsData {
  overview: {
    total_bookings: number;
    active_services: number;
    average_rating: number;
    total_reviews: number;
    verification_status: string;
  };
  revenue_stats: {
    total_revenue: number;
    pending_revenue: number;
    average_booking_value: number;
  };
  booking_stats: {
    pending: number;
    accepted: number;
    completed: number;
    cancelled: number;
    conversion_rate: number;
  };
  rating_stats: {
    average: number;
    distribution: Record<string, number>;
    breakdown: {
      quality: number;
      communication: number;
      value: number;
      punctuality: number;
    };
  };
  recent_activity: ActivityItem[];
}

interface DashboardData {
  services: Service[];
  analytics: AnalyticsData | null;
}

const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    services: [],
    analytics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesResponse, analyticsResponse] = await Promise.all([
        apiService.services.getAll(),
        apiService.analytics.dashboard()
      ]);

      setDashboardData({
        services: servicesResponse.data.services || [],
        analytics: analyticsResponse.data
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      setIsRequestingVerification(true);
      await apiService.profiles.requestVerification();
      toast.success('Verification request submitted successfully!');
      loadDashboardData(); // Reload to update status
    } catch (err) {
      toast.error('Failed to submit verification request.');
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const handleServiceUpdate = () => {
    loadDashboardData();
  };

  const renderVerificationStatus = () => {
    if (!dashboardData.analytics) return null;
    
    const status = dashboardData.analytics.overview.verification_status;
    
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-1 flex items-center gap-1">
            <ShieldCheck className="size-3" /> Verified Partner
          </Badge>
        );
      case 'pending_verification':
        return (
          <Badge variant="outline" className="text-orange-500 border-orange-500 rounded-full px-3 py-1 flex items-center gap-1">
            <Clock className="size-3" /> Verification Pending
          </Badge>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="rounded-full px-3 py-1 flex items-center gap-1">
              <AlertCircle className="size-3" /> Rejected
            </Badge>
            <Button size="sm" variant="outline" onClick={handleRequestVerification} disabled={isRequestingVerification} className="h-8 text-xs rounded-full">
              Re-apply
            </Button>
          </div>
        );
      default:
        return (
          <Button size="sm" onClick={handleRequestVerification} disabled={isRequestingVerification} className="h-8 text-xs rounded-full bg-blue-500 hover:bg-blue-600 text-white">
            <ShieldCheck className="mr-1 size-3" /> Get Verified
          </Button>
        );
    }
  };

  const renderOverview = () => {
    if (!dashboardData.analytics) return null;
    const { analytics } = dashboardData;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-10"
      >
        {/* Verification Status Banner */}
        {analytics.overview.verification_status !== 'verified' && (
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="font-normal text-blue-900">Professional Verification</p>
                  <p className="text-xs text-blue-700 font-light text-center sm:text-left">Get the blue tick to build trust and get 3x more booking requests.</p>
                </div>
              </div>
              {renderVerificationStatus()}
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Bookings', value: analytics.overview.total_bookings, icon: CalendarIcon, color: 'text-purple-500' },
            { label: 'Total Revenue', value: `₹${analytics.revenue_stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
            { label: 'Active Services', value: analytics.overview.active_services, icon: Briefcase, color: 'text-blue-500' },
            { label: 'Avg. Rating', value: analytics.overview.average_rating || 'N/A', icon: Star, color: 'text-orange-500' },
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
              <h3 className="text-2xl font-light tracking-tight">Your Services</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('services')} className="font-light rounded-full">
                Manage
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
                      <Badge variant={service.status === 'active' ? 'secondary' : 'outline'} className="rounded-full font-normal capitalize">
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

          {/* Activity Feed */}
          <div className="space-y-6">
            <h3 className="text-2xl font-light tracking-tight">Recent Activity</h3>
            <Card className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {analytics.recent_activity.length > 0 ? (
                  <div className="divide-y divide-border">
                    {analytics.recent_activity.map((activity, idx) => (
                      <div key={`${activity.type}-${activity.id}-${idx}`} className="p-4 flex gap-4 hover:bg-secondary/30 transition-colors">
                        <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'booking' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {activity.type === 'booking' ? <CalendarIcon size={16} /> : <Star size={16} />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-normal leading-tight">
                            {activity.type === 'booking' 
                              ? `New booking from ${activity.customer}` 
                              : `New ${activity.rating}-star review from ${activity.customer}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-light">
                            <Clock size={12} />
                            {new Date(activity.date).toLocaleDateString()}
                            {activity.amount && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="font-normal text-foreground">₹${activity.amount.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Clock className="size-8 mx-auto mb-3 text-muted-foreground opacity-20" strokeWidth={1} />
                    <p className="text-sm text-muted-foreground font-light">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    );
  };

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
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl md:text-5xl font-extralight tracking-tight">Dashboard</h1>
                {dashboardData.analytics?.overview.verification_status === 'verified' && (
                  <div className="bg-blue-500 text-white rounded-full p-1 self-center" title="Verified Professional">
                    <ShieldCheck size={20} />
                  </div>
                )}
              </div>
              <p className="text-xl text-muted-foreground font-light">Welcome back, {user?.first_name || 'Partner'}</p>
            </div>
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
                <AlertCircle className="size-4" /> {error}
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
              {activeTab === 'calendar' && <BookingCalendar bookings={[]} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VendorDashboard;
