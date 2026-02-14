import { useParams, useNavigate } from 'react-router';
import { photographers } from '../data/photographers';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, MapPin, IndianRupee, Calendar, Award, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function PhotographerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const photographer = photographers.find((p) => p.id === id);

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-light mb-4">Photographer not found</h2>
          <Button onClick={() => navigate('/dashboard')} className="rounded-full font-normal">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    toast.success('Booking request sent! The photographer will contact you soon.');
  };

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
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-2 rounded-full font-normal hover:bg-secondary"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Back to Dashboard
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
                  src={photographer.image}
                  alt={photographer.name}
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
                      {photographer.name}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3 font-light">
                      <MapPin className="size-5" strokeWidth={1.5} />
                      <span className="text-lg">{photographer.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-foreground text-white px-4 py-2 rounded-full">
                    <Star className="size-5 fill-white" strokeWidth={1.5} />
                    <span className="text-lg font-normal">{photographer.rating}</span>
                    <span className="text-sm opacity-80">({photographer.reviewCount})</span>
                  </div>
                </div>

                <p className="text-lg text-foreground font-light leading-relaxed mb-6">
                  {photographer.bio}
                </p>

                <div className="flex flex-wrap gap-2">
                  {photographer.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="font-normal rounded-full bg-secondary">
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
                    <div className="text-2xl font-light mb-1">{photographer.yearsOfExperience}</div>
                    <div className="text-sm text-muted-foreground font-light">Years Experience</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-white">
                  <CardContent className="p-6 text-center">
                    <Calendar className="size-8 mx-auto mb-3 text-foreground" strokeWidth={1.5} />
                    <div className="text-2xl font-light mb-1">{photographer.availableSlots}</div>
                    <div className="text-sm text-muted-foreground font-light">Slots Available</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-white">
                  <CardContent className="p-6 text-center">
                    <Star className="size-8 mx-auto mb-3 text-foreground" strokeWidth={1.5} />
                    <div className="text-2xl font-light mb-1">{photographer.reviewCount}</div>
                    <div className="text-sm text-muted-foreground font-light">Reviews</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Portfolio Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-3xl font-light tracking-tight mb-6">Portfolio</h2>
                <div className="grid grid-cols-2 gap-4">
                  {photographer.portfolio.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-3xl font-light tracking-tight mb-6">Services Offered</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {photographer.services.map((service, index) => (
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
                        <span className="text-4xl font-light tracking-tight">{photographer.priceRange}</span>
                      </div>
                      <div className="text-sm text-muted-foreground font-light">per event</div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      className="w-full bg-foreground hover:bg-foreground/90 h-12 rounded-full font-normal mb-6"
                    >
                      Request Booking
                    </Button>

                    <div className="space-y-4 pt-6 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-light">Response time</span>
                        <span className="text-sm font-normal">Within 24 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-light">Availability</span>
                        <span className="text-sm font-normal">
                          {photographer.availableSlots > 0 ? 'Available' : 'Fully Booked'}
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
