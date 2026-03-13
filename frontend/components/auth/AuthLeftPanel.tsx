'use client';

import { motion } from 'framer-motion';
import { Camera, Star } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function AuthLeftPanel() {
  const testimonial = {
    name: 'Sarah Johnson',
    role: 'Event Manager',
    quote: 'Jashnify made finding the perfect photographer effortless. Highly recommended!',
    rating: 5,
  };

  const stats = [
    { label: '2,700+', text: 'Verified Professionals' },
    { label: '15k+', text: 'Events Captured' },
  ];

  return (
    <div className="hidden lg:flex lg:w-[45%] relative flex-col overflow-hidden">
      {/* Background Image with Overlay */}
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1800"
        alt="Wedding Photography"
        fill
        unoptimized
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-12">
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm border border-primary/30">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-white">jashnify</span>
        </motion.div>

        {/* Floating Stats Badges */}
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="glass-strong rounded-xl px-4 py-3 w-fit max-w-xs"
            >
              <div className="text-lg font-bold text-primary">{stat.label}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.text}</div>
            </motion.div>
          ))}
        </div>

        {/* Center Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-sm"
        >
          <h2 className="text-4xl font-bold leading-tight mb-4 text-white">
            Every moment <br />
            <span className="text-primary">deserves</span> to be <br />
            remembered.
          </h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            Connect with verified professionals and capture your most precious moments with ease.
          </p>
        </motion.div>

        {/* Bottom Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-strong rounded-xl p-4 backdrop-blur-md w-full"
        >
          <div className="flex gap-1 mb-3">
            {Array(testimonial.rating)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-primary text-primary"
                />
              ))}
          </div>
          <p className="text-sm text-foreground/90 mb-4 font-light">
            "{testimonial.quote}"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {testimonial.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {testimonial.name}
              </div>
              <div className="text-xs text-muted-foreground">{testimonial.role}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
