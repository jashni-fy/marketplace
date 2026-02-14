import { Photographer } from '../data/photographers';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, MapPin, IndianRupee } from 'lucide-react';
import { Link } from 'react-router';

interface PhotographerCardProps {
  photographer: Photographer;
}

export default function PhotographerCard({ photographer }: PhotographerCardProps) {
  return (
    <Link to={`/photographer/${photographer.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer group border-border bg-white">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={photographer.image}
            alt={photographer.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {photographer.availableSlots <= 3 && (
            <Badge className="absolute top-4 right-4 bg-black text-white hover:bg-black/90 font-normal rounded-full">
              {photographer.availableSlots} slots left
            </Badge>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-normal text-xl tracking-tight">{photographer.name}</h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-foreground text-foreground" strokeWidth={1.5} />
              <span className="font-normal">{photographer.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 font-light">
            <MapPin className="size-4" strokeWidth={1.5} />
            <span>{photographer.location}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-light">
            {photographer.bio}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {photographer.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs font-normal rounded-full bg-secondary">
                {category}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-sm font-normal">
              <IndianRupee className="size-4" strokeWidth={1.5} />
              <span>{photographer.priceRange}</span>
            </div>
            <p className="text-xs text-muted-foreground font-light">
              {photographer.yearsOfExperience}y exp
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}