'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MapPin, IndianRupee, Calendar, Award, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { apiService } from '@/lib/api';

export default function PhotographerDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [photographer, setPhotographer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchPhotographer = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const photographerId = Array.isArray(id) ? id[0] : id;
        const response = await apiService.vendors.getById(photographerId);
        setPhotographer(response.data.vendor || response.data);
      } catch (err: any) {
        console.error('Error fetching photographer:', err);
        setError('Photographer not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotographer();
  }, [id]);

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      // In a real app, we'd open a dialog to select date/time
      // For now, we'll try to create a placeholder booking or just redirect to a booking flow
      // router.push(`/booking/${photographer.id}`);
      
      // Simulating booking request
      toast.success('Booking request sent! The photographer will contact you soon.');
    } catch (err) {
      toast.error('Failed to send booking request. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="space-y-8">
            <Skeleton className="h-10 w-40 rounded-full" />
            <div className="grid lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-10">
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <div className="space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <AlertCircle className="size-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-light mb-4">{error || 'Photographer not found'}</h2>
          <Button onClick={() => router.push('/marketplace')} className="rounded-full font-normal">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const name = photographer.name || photographer.business_name || 'Anonymous Photographer';
  const image = photographer.image || photographer.profile_image_url || photographer.image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';
  const rating = photographer.rating || photographer.average_rating || 0;
  const reviewCount = photographer.reviewCount || photographer.reviews_count || 0;
  const location = photographer.location || photographer.city || 'Location not specified';
  const bio = photographer.bio || photographer.description || 'No bio available.';
  const categories = photographer.categories || (photographer.service_category ? [photographer.service_category] : []);
  const priceRange = photographer.priceRange || (photographer.base_price ? `₹${photographer.base_price}` : 'Price on request');
  const yearsOfExperience = photographer.yearsOfExperience || photographer.experience_years || 0;
  const availableSlots = photographer.availableSlots ?? 10;
  const portfolio = photographer.portfolio || photographer.portfolio_images || [];
  const services = photographer.services || (photographer.offered_services ? photographer.offered_services.map((s: any) => s.name) : ['Photography', 'Editing', 'High-res images']);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/marketplace')}
            className="mb-8 flex items-center gap-2 rounded-full font-normal hover:bg-secondary"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Back to Marketplace
          </Button>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-10">
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative aspect-[16/10] overflow-hidden rounded-2xl"
              >
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-extralight tracking-tight mb-3">
                      {name}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3 font-light">
                      <MapPin className="size-5" strokeWidth={1.5} />
                      <span className="text-lg">{location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-foreground text-white px-4 py-2 rounded-full">
                    <Star className="size-5 fill-white" strokeWidth={1.5} />
                    <span className="text-lg font-normal">{Number(rating).toFixed(1)}</span>
                    <span className="text-sm opacity-80">({reviewCount})</span>
                  </div>
                </div>

                <p className="text-lg text-foreground font-light leading-relaxed mb-6 whitespace-pre-wrap">
                  {bio}
                </p>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category: string) => (
                    <Badge key={category} variant="secondary" className="font-normal rounded-full bg-secondary capitalize">
                      {category}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              {/* Details Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid sm:grid-cols-3 gap-6"
              >
                <Card className="border-border bg-white">
                  <CardContent className="p-6 text-center">
                    <Award className="size-8 mx-auto mb-3 text-foreground" strokeWidth={1.5} />
                    <div className="text-2xl font-light mb-1">{yearsOfExperience}</div>
                    <div className="text-sm text-muted-foreground font-light">Years Experience</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-white">
                  <CardContent className="p-6 text-center">
                    <Calendar className="size-8 mx-auto mb-3 text-foreground" strokeWidth={1.5} />
                    <div className="text-2xl font-light mb-1">{availableSlots}</div>
                    <div className="text-sm text-muted-foreground font-light">Slots Available</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-white">
                  <CardContent className="p-6 text-center">
                    <Star className="size-8 mx-auto mb-3 text-foreground" strokeWidth={1.5} />
                    <div className="text-2xl font-light mb-1">{reviewCount}</div>
                    <div className="text-sm text-muted-foreground font-light">Reviews</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Portfolio Gallery */}
              {portfolio.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h2 className="text-3xl font-light tracking-tight mb-6">Portfolio</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {portfolio.map((img: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer"
                      >
                        <img
                          src={typeof img === 'string' ? img : img.url}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-3xl font-light tracking-tight mb-6">Services Offered</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {services.map((service: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                        <Check className="size-4 text-white" strokeWidth={2} />
                      </div>
                      <span className="font-light">{service}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Booking Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="lg:sticky lg:top-28">
                <Card className="border-border bg-white shadow-lg">
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <div className="text-sm text-muted-foreground font-light mb-2">Starting from</div>
                      <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="size-6 text-foreground" strokeWidth={1.5} />
                        <span className="text-4xl font-light tracking-tight">{priceRange}</span>
                      </div>
                      <div className="text-sm text-muted-foreground font-light">per event</div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full bg-foreground hover:bg-foreground/90 h-12 rounded-full font-normal mb-6 text-white"
                    >
                      {isBooking ? 'Sending...' : 'Request Booking'}
                    </Button>

                    <div className="space-y-4 pt-6 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-light">Response time</span>
                        <span className="text-sm font-normal">Within 24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-light">Availability</span>
                        <span className="text-sm font-normal">
                          {availableSlots > 0 ? 'Available' : 'Fully Booked'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-light">Booking type</span>
                        <span className="text-sm font-normal">Instant confirmation</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <p className="text-sm text-muted-foreground font-light text-center">
                        Free cancellation up to 48 hours before the event
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
