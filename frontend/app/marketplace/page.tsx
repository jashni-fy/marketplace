'use client';

import { useState, useEffect } from 'react';
import PhotographerCard from '@/components/PhotographerCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  Camera, 
  Cake, 
  PartyPopper, 
  Briefcase, 
  Users, 
  Grid, 
  Search, 
  AlertCircle,
  Filter,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const iconMap = {
  Grid,
  Heart,
  Camera,
  Cake,
  PartyPopper,
  Briefcase,
  Users,
};

const categories = [
  { id: 'all', name: 'All', icon: 'Grid' },
  { id: 'wedding', name: 'Wedding', icon: 'Heart' },
  { id: 'pre-wedding', name: 'Pre-Wedding', icon: 'Camera' },
  { id: 'birthday', name: 'Birthday', icon: 'Cake' },
  { id: 'party', name: 'Party', icon: 'PartyPopper' },
  { id: 'corporate', name: 'Corporate', icon: 'Briefcase' },
  { id: 'family', name: 'Family', icon: 'Users' },
] as const;

const pricingTypes = [
  { id: 'all', name: 'All Pricing' },
  { id: 'hourly', name: 'Hourly' },
  { id: 'package', name: 'Package' },
  { id: 'custom', name: 'Custom' },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPricingType, setSelectedPricingType] = useState('all');
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (selectedCategory !== 'all') params.category_id = selectedCategory;
        if (searchQuery) params.q = searchQuery;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (selectedPricingType !== 'all') params.pricing_type = selectedPricingType;
        
        const response = await apiService.services.search(params);
        const data = response.data.services || [];
        
        // Group services by vendor for marketplace view
        const uniqueVendors = Array.from(new Set(data.map((s: any) => s.vendor.id))).map(id => {
          const service = data.find((s: any) => s.vendor.id === id);
          return {
            ...service.vendor,
            base_price: service.base_price,
            service_categories: [service.category?.name].filter(Boolean)
          };
        });
        
        setVendors(uniqueVendors);
      } catch (err: any) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load photographers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchVendors, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, minPrice, maxPrice, selectedPricingType]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500"
            >
              Marketplace
            </motion.h1>
            <p className="text-xl text-slate-400 font-light mb-12">
              Connect with top-tier creative professionals for your next landmark event
            </p>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" strokeWidth={1.5} />
                <Input
                  type="text"
                  placeholder="Search professionals, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/[0.03] border-white/[0.05] rounded-2xl focus:ring-primary/50 text-white placeholder:text-slate-600"
                />
              </div>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                className={`h-14 px-6 rounded-2xl border-white/[0.05] font-bold uppercase tracking-widest text-[10px] gap-2 ${showFilters ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-white/[0.03]'}`}
              >
                <Filter className="size-4" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="max-w-3xl mx-auto mt-6 overflow-hidden"
                >
                  <div className="p-6 rounded-3xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Min Price</label>
                      <Input 
                        type="number" 
                        placeholder="₹ Min" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="bg-[#0f1115] border-white/[0.05] h-11 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Max Price</label>
                      <Input 
                        type="number" 
                        placeholder="₹ Max" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="bg-[#0f1115] border-white/[0.05] h-11 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Pricing Type</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-11 justify-between rounded-xl bg-[#0f1115] border-white/[0.05] font-medium text-slate-400">
                            {pricingTypes.find(t => t.id === selectedPricingType)?.name}
                            <ChevronDown className="size-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-[#16191e] border-white/[0.05] text-white">
                          {pricingTypes.map((type) => (
                            <DropdownMenuItem 
                              key={type.id} 
                              onClick={() => setSelectedPricingType(type.id)}
                              className="focus:bg-primary/20 focus:text-primary cursor-pointer font-medium"
                            >
                              {type.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="sticky top-20 z-40 bg-[#0f1115]/80 backdrop-blur-xl border-y border-white/[0.03] py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map((category) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap];
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 h-10 px-5 rounded-full font-bold uppercase tracking-widest text-[10px] shrink-0 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-6 py-16">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <p className="text-xl text-slate-400 font-light">{error}</p>
            <Button variant="outline" className="mt-6 rounded-xl border-white/10" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-white/[0.03] pb-6">
               <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Featured Pros</h2>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Found {vendors.length} matching experts</p>
               </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-white/[0.03]" />
                    <div className="space-y-2 px-1">
                      <Skeleton className="h-4 w-3/4 bg-white/[0.03]" />
                      <Skeleton className="h-3 w-1/2 bg-white/[0.03]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-white/[0.03] rounded-[3rem]">
                <div className="size-16 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-6 text-slate-600">
                   <Search className="size-8" />
                </div>
                <p className="text-xl text-slate-400 font-light tracking-tight">No experts found matching your criteria</p>
                <p className="text-sm text-slate-600 mt-2 font-medium">Try adjusting your filters or search terms</p>
                <Button variant="link" onClick={() => {
                   setSelectedCategory('all');
                   setSearchQuery('');
                   setMinPrice('');
                   setMaxPrice('');
                   setSelectedPricingType('all');
                }} className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px]">Clear all filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendors.map((vendor, index) => (
                  <motion.div
                    key={`${vendor.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <PhotographerCard photographer={vendor} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
