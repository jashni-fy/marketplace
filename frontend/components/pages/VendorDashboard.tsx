'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
import ServiceManagement from '../ServiceManagement';
import PortfolioManager from '../PortfolioManager';
import BookingCalendar from '../BookingCalendar';
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
  Star,
  ChevronRight,
  User,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>({
    services: [],
    analytics: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'portfolio', name: 'Portfolio', icon: ImageIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const renderOverview = () => {
    const analytics = dashboardData.analytics;
    if (!analytics) return null;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenue', value: `₹${analytics.revenue_stats.total_revenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%' },
            { label: 'Bookings', value: analytics.overview.total_bookings, icon: CalendarIcon, trend: '+3 today' },
            { label: 'Active', value: analytics.overview.active_services, icon: Briefcase, trend: 'Running' },
            { label: 'Rating', value: analytics.overview.average_rating || 'N/A', icon: Star, trend: 'Top 5%' },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] hover:border-primary/20 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
                <stat.icon className="size-4 text-slate-600 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-end justify-between">
                <h4 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h4>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <TrendingUp size={120} strokeWidth={1} />
               </div>
               <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1">Growth Overview</h3>
                  <p className="text-xs text-slate-500 mb-8">Your profile performance over the last 30 days</p>
                  <div className="h-48 w-full flex items-end justify-between gap-2">
                     {[40, 70, 45, 90, 65, 80, 100, 55, 75, 60, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/10 rounded-t-sm hover:bg-primary/40 transition-all cursor-pointer relative group/bar" style={{ height: `${h}%` }}>
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                              {h}% increase
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Recent Services</h3>
                  <div className="space-y-4">
                     {dashboardData.services.slice(0, 3).map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/[0.02]">
                           <div className="flex items-center gap-3">
                              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                 <Briefcase size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-white">{s.name}</p>
                                 <p className="text-[10px] text-slate-500">{s.formatted_price}</p>
                              </div>
                           </div>
                           <ChevronRight size={14} className="text-slate-700" />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setActiveTab('services')} className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center gap-2 hover:bg-primary/20 transition-all">
                        <Plus size={20} className="text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase">New Service</span>
                     </button>
                     <button onClick={() => setActiveTab('portfolio')} className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center gap-2 hover:bg-blue-500/20 transition-all">
                        <Plus size={20} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Add Media</span>
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
             <div className="p-6 rounded-2xl border border-white/[0.03] bg-[#16191e]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Real-time Feed</h3>
                <div className="space-y-6">
                   {analytics.recent_activity.map((activity: any, idx: number) => (
                      <div key={idx} className="flex gap-4 relative">
                         {idx !== analytics.recent_activity.length - 1 && (
                            <div className="absolute top-8 left-4 bottom-0 w-px bg-white/[0.05]" />
                         )}
                         <div className={`size-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            activity.type === 'booking' ? 'bg-orange-500/20 text-orange-400' : 'bg-primary/20 text-primary'
                         }`}>
                            {activity.type === 'booking' ? <CalendarIcon size={14} /> : <Star size={14} />}
                         </div>
                         <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-200 leading-snug">{activity.customer}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                               {activity.type === 'booking' ? 'Requested a new wedding session' : 'Left a 5-star review'}
                            </p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/10 border border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                   <ShieldCheck className="size-10 text-primary mb-4" />
                   <h4 className="text-lg font-bold text-white mb-2">Get Verified</h4>
                   <p className="text-xs text-slate-400 font-light mb-6">Build trust with a professional badge and reach more clients.</p>
                   <Button size="sm" className="w-full bg-white text-black font-bold rounded-lg h-9">Upgrade Now</Button>
                </div>
                <div className="absolute -bottom-10 -right-10 size-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all" />
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex text-foreground font-sans">
      {/* High Density Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/[0.03] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Camera className="size-5 text-primary" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">jashnify</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary/10 text-primary border border-primary/10' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-white/[0.03]">
            <div className="flex items-center gap-3 px-4 py-2">
               <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
               </div>
               <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro Vendor</p>
               </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-auto max-h-screen">
        <header className="h-16 border-b border-white/[0.03] bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                 {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                 {navItems.find(n => n.id === activeTab)?.name}
              </h2>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Search dashboard..." 
                    className="bg-white/[0.03] border border-white/[0.05] rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 w-64 transition-all"
                 />
              </div>
              <button className="p-2 text-slate-400 hover:text-white relative">
                 <Bell size={18} />
                 <span className="absolute top-2 right-2 size-1.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </button>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <div key="loading" className="space-y-8 animate-pulse">
                <div className="grid grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/[0.02] rounded-xl border border-white/[0.03]" />)}
                </div>
                <div className="h-96 bg-white/[0.02] rounded-2xl border border-white/[0.03]" />
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'services' && <ServiceManagement services={dashboardData.services} onServiceUpdate={loadDashboardData} />}
                {activeTab === 'portfolio' && <PortfolioManager />}
                {activeTab === 'calendar' && <BookingCalendar bookings={[]} />}
                {activeTab === 'settings' && (
                   <div className="p-12 text-center border-2 border-dashed border-white/[0.03] rounded-3xl opacity-30">
                      <Settings className="size-12 mx-auto mb-4" strokeWidth={1} />
                      <p className="font-bold uppercase tracking-widest text-xs">Settings coming soon</p>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
