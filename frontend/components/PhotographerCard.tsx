import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, IndianRupee } from 'lucide-react';
import Link from 'next/link';

interface PhotographerCardProps {
  photographer: any; // Allow any for API flexibility
}

export default function PhotographerCard({ photographer }: PhotographerCardProps) {
  // Map API fields or provide defaults
  const id = photographer.id;
  const name = photographer.name || photographer.business_name || 'Anonymous Photographer';
  const image = photographer.image || photographer.profile_image_url || photographer.image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';
  const rating = photographer.rating || photographer.average_rating || 0;
  const location = photographer.location || photographer.city || 'Location not specified';
  const bio = photographer.bio || photographer.description || 'No bio available.';
  const categories = photographer.categories || (photographer.service_category ? [photographer.service_category] : []);
  const priceRange = photographer.priceRange || (photographer.base_price ? `Starts from ₹${photographer.base_price}` : 'Price on request');
  const yearsOfExperience = photographer.yearsOfExperience || photographer.experience_years || 0;
  const availableSlots = photographer.availableSlots ?? 10;

  return (
    <Link href={`/photographer/${id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer group border-border bg-white h-full flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {availableSlots <= 3 && availableSlots > 0 && (
            <Badge className="absolute top-4 right-4 bg-black text-white hover:bg-black/90 font-normal rounded-full">
              {availableSlots} slots left
            </Badge>
          )}
        </div>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-normal text-xl tracking-tight line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm flex-shrink-0">
              <Star className="size-4 fill-foreground text-foreground" strokeWidth={1.5} />
              <span className="font-normal">{Number(rating).toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 font-light">
            <MapPin className="size-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="line-clamp-1">{location}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light flex-1">
            {bio}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 3).map((category: string) => (
              <Badge key={category} variant="secondary" className="text-xs font-normal rounded-full bg-secondary capitalize">
                {category}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <div className="flex items-center gap-1 text-sm font-normal">
              <IndianRupee className="size-4" strokeWidth={1.5} />
              <span className="line-clamp-1">{priceRange}</span>
            </div>
            <p className="text-xs text-muted-foreground font-light flex-shrink-0">
              {yearsOfExperience}y exp
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
