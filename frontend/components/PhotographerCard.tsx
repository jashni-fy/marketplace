import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PhotographerCardProps {
  photographer: any;
}

export default function PhotographerCard({ photographer }: PhotographerCardProps) {
  const id = photographer.id;
  const name = photographer.name || photographer.business_name || 'Anonymous';
  const image = photographer.image || photographer.profile_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop';
  const rating = photographer.rating || photographer.average_rating || 0;
  const totalReviews = photographer.total_reviews || 0;
  const location = photographer.location || 'Unknown';
  const priceRange = photographer.base_price ? `₹${photographer.base_price}` : 'Price on request';

  return (
    <Link href={`/vendors/${id}`}>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-white/5 bg-secondary/20 transition-all duration-500">
        {/* Imagery as Hero */}
        <Image
          src={image}
          alt={name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
        />
        
        {/* Permanent Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60" />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/40 backdrop-blur-md border border-white/5">
          <Star className="size-3 fill-primary text-primary" />
          <span className="text-[10px] font-bold text-white tracking-tighter">{Number(rating).toFixed(1)}</span>
          {totalReviews > 0 && (
            <span className="text-[9px] font-medium text-slate-300 tracking-tighter">({totalReviews})</span>
          )}
        </div>

        {/* Bottom Permanent Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-sm font-bold text-white truncate tracking-tight mb-0.5">{name}</h3>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-medium tracking-tight truncate flex items-center gap-1">
              <MapPin className="size-2.5 text-primary" /> {location}
            </span>
          </div>
        </div>

        {/* Hover: Detail Reveal */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col justify-end p-4">
           <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(photographer.service_categories || []).slice(0, 2).map((cat: string) => (
                  <span key={cat} className="text-[9px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-tighter text-slate-400">Starting from</span>
                  <span className="text-sm font-bold text-white">{priceRange}</span>
                </div>
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <ChevronRight className="size-4" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </Link>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-9-6" />
    </svg>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-9-6" />
    </svg>
  );
}
