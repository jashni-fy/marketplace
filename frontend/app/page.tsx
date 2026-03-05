'use client';

import { motion } from 'framer-motion';
import { Camera, LogIn, UserPlus, ArrowRight, Check, Sparkles } from 'lucide-react';
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
                <Button variant="ghost" size="sm" className="rounded-full text-slate-400 hover:text-white">Sign In</Button>
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
            className="text-base md:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            Find and book premium professional photographers for your special events with ease.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => router.push('/register')} className="rounded-full font-bold px-10 h-12 shadow-xl shadow-primary/10">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/marketplace')} className="rounded-full font-bold px-10 h-12 bg-transparent border-border/50 text-slate-300 hover:bg-secondary">
              Browse Pros
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories - Compact Grid */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Popular Categories</h2>
              <p className="text-slate-400 text-sm font-light">Tailored services for every need</p>
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

      {/* Features - Simplified Layout */}
      <section className="py-20 px-6 bg-secondary/20 border-y border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Quality meets <br /><span className="text-primary">Simplicity.</span>
              </h2>
              <p className="text-slate-400 font-light leading-relaxed">
                The modern way to handle event photography. No more endless back-and-forth emails or unverified portfolios.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Check className="size-3 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{feature}</span>
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

      {/* Compact CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8 p-12 glass rounded-3xl border border-primary/10 shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready to begin?</h2>
          <p className="text-slate-400 font-light">Join Jashnify today and connect with professional photographers.</p>
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
