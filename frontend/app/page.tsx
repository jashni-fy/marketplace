'use client';

import { motion } from 'framer-motion';
import { Camera, ArrowRight, Check, Sparkles, Search, Star, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Link from 'next/link';

export default function Landing() {
  const router = useRouter();

  const categories = [
    {
      name: 'Weddings',
      image: 'https://images.unsplash.com/photo-1769038933441-2457038f8dda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8fHxlbGVnYW50JTIwYnJpZGUlMjBwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTA4MjM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Celebrations',
      image: 'https://images.unsplash.com/photo-1767790692964-93711dff01b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHx8fHxjb3VwbGUlMjBjZWxlYnJhdGlvbiUyMHBhcnR5JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzcxMDgyMzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1727791719116-39761d569f32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHx8fHxmYXNoaW9uJTIwcG9ydHJhaXQlMjBtb2RlbCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTA4MjM0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  const features = [
    'Verified professionals',
    'Instant booking',
    'Portfolio preview',
    'Secure payment',
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Compact Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Camera className="size-5 text-primary" strokeWidth={2} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">jashnify</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-white">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-primary-foreground rounded-full font-bold px-5">Join</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Reduced height and simplified */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1769230385107-bc6eaa7a123e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHx8fHxwcm9mZXNzaW9uYWwlMjB3ZWRkaW5nJTIwcGhvdG9ncmFwaGVyJTIwY2FtZXJhfGVufDF8fHx8MTc3MTA4MjM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Hero"
            fill
            unoptimized
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Rated Talent</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-white"
          >
            Capture the moments <br /> that matter.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            Find and book premium professional photographers for your special events with ease.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-lg flex flex-col items-center gap-6"
          >
            {/* Search Bar */}
            <div onClick={() => router.push('/marketplace')} className="flex items-center gap-3 px-5 py-3.5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 cursor-pointer hover:border-primary/40 transition-all group shadow-xl shadow-black/20 w-full">
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-sm text-muted-foreground flex-1 text-left">Find photographers, videographers, planners...</span>
              <div className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Search</div>
            </div>

            {/* Secondary Links */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button onClick={() => router.push('/register')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Create free account
              </button>
              <div className="w-1 h-1 rounded-full bg-border" />
              <button onClick={() => router.push('/marketplace')} className="text-sm font-medium text-primary inline-flex items-center gap-1">
                Browse professionals <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="border-y border-border/20 bg-secondary/10 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: '2,700+', text: 'Verified Professionals' },
              { icon: Camera, label: '15,000+', text: 'Events Captured' },
              { icon: Star, label: '98%', text: 'Client Satisfaction' },
              { icon: Check, label: '₹0', text: 'Platform Fee' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.label}</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-widest">{stat.text}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories - Compact Grid */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Popular Categories</h2>
              <p className="text-muted-foreground text-sm font-light">Tailored services for every need</p>
            </div>
            <Link href="/marketplace" className="text-primary text-sm font-bold hover:underline underline-offset-4 flex items-center gap-1">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer relative aspect-[4/5] rounded-2xl overflow-hidden border border-border/30"
              >
                <ImageWithFallback
                  src={category.image}
                  alt={category.name}
                  fill
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-5 left-5">
                  <h3 className="text-lg font-bold text-white mb-0.5">{category.name}</h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Explore</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-muted-foreground font-light">Three simple steps to find the perfect professional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

            {[
              { step: 1, title: 'Search & Filter', desc: 'Browse verified professionals in your area' },
              { step: 2, title: 'Review Portfolios', desc: 'Check past work and client reviews' },
              { step: 3, title: 'Book Instantly', desc: 'Secure your booking with just a few clicks' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-secondary border border-border/50 flex items-center justify-center relative z-10">
                    <span className="text-lg font-bold text-primary">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Simplified Layout */}
      <section className="py-20 px-6 bg-secondary/20 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Quality meets <br /><span className="text-primary">Simplicity.</span>
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed">
                The modern way to handle event photography. No more endless back-and-forth emails or unverified portfolios.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Check className="size-3 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
               <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHx8fHxjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MTA4MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Feature"
                  fill
                  unoptimized
                  className="object-cover"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Loved by Users</h2>
            <p className="text-muted-foreground font-light">See what professionals and customers are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Jashnify made finding photographers so easy. Booked someone amazing for my wedding!',
                author: 'Priya Sharma',
                role: 'Bride',
                initials: 'PS',
                rating: 5,
              },
              {
                quote: 'As a photographer, this platform helps me get consistent bookings. Highly recommended!',
                author: 'Rahul Kapoor',
                role: 'Professional Photographer',
                initials: 'RK',
                rating: 5,
              },
              {
                quote: 'Best decision for our corporate event. The vendor matching is incredible.',
                author: 'Anjali Patel',
                role: 'Event Manager',
                initials: 'AP',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30"
              >
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                </div>
                <p className="text-foreground/90 text-sm font-light mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{testimonial.initials}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8 p-12 glass rounded-3xl border border-primary/10 shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready to begin?</h2>
          <p className="text-muted-foreground font-light">Join Jashnify today and connect with professional photographers.</p>
          <Button size="lg" onClick={() => router.push('/register')} className="rounded-full px-12 font-bold h-12 shadow-lg shadow-primary/20">
            Create Account
          </Button>
        </motion.div>
      </section>

      <footer className="py-10 border-t border-border/30 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Camera className="size-4 text-primary" />
          <span className="text-sm font-bold text-white uppercase tracking-tighter">jashnify</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">&copy; 2026 Jashnify. All rights reserved.</p>
      </footer>
    </div>
  );
}
