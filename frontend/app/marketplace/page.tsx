'use client';

import { useState, useEffect } from 'react';
import PhotographerCard from '@/components/PhotographerCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Camera, Cake, PartyPopper, Briefcase, Users, Grid, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/api';

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

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchQuery) {
          params.q = searchQuery;
        }
        
        const response = await apiService.vendors.getAll(params);
        // Assuming response.data contains the list of vendors or is the list
        const data = response.data.vendors || response.data;
        setVendors(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load photographers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchVendors, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Minimalist */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-extralight tracking-tight mb-6"
            >
              Marketplace
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground font-light mb-12"
            >
              Discover and book talented photographers for your special moments
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative max-w-2xl mx-auto"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" strokeWidth={1.5} />
              <Input
                type="text"
                placeholder="Search by name, location, or speciality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-border rounded-full font-light"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-background py-10 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => {
              const Icon = iconMap[category.icon as keyof typeof iconMap];
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Button
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 h-10 rounded-full font-normal ${
                      selectedCategory === category.id
                        ? 'bg-foreground hover:bg-foreground/90 text-white'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={1.5} />
                    {category.name}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Photographers Grid */}
      <section className="container mx-auto px-6 py-16">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="size-12 text-destructive mb-4" />
            <p className="text-xl text-muted-foreground font-light">{error}</p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground font-light">No photographers found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground font-light">
                    Showing {vendors.length} photographer{vendors.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {vendors.map((vendor, index) => (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PhotographerCard photographer={vendor} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
