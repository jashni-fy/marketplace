import { useState } from 'react';
import { photographers } from '../data/photographers';
import { categories } from '../data/photographers';
import PhotographerCard from '../components/PhotographerCard';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Heart, Camera, Cake, PartyPopper, Briefcase, Users, Grid, Search } from 'lucide-react';
import { motion } from 'motion/react';

const iconMap = {
  Grid,
  Heart,
  Camera,
  Cake,
  PartyPopper,
  Briefcase,
  Users,
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotographers = photographers.filter((photographer) => {
    const matchesCategory = selectedCategory === 'all' || photographer.categories.includes(selectedCategory);
    const matchesSearch = photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photographer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photographer.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Dashboard
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filteredPhotographers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground font-light">No photographers found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm text-muted-foreground font-light">
                  Showing {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPhotographers.map((photographer, index) => (
                  <motion.div
                    key={photographer.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <PhotographerCard photographer={photographer} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}
