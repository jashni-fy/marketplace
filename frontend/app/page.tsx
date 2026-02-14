'use client';

import { motion } from 'framer-motion';
import { Camera, LogIn, UserPlus, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Link from 'next/link';

export default function Landing() {
  const router = useRouter();

  const categories = [
    {
      name: 'Weddings',
      image: 'https://images.unsplash.com/photo-1769038933441-2457038f8dda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8fHxlbGVnYW50JTIwYnJpZGUlMjBwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MTA4MjM0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
    'Curated professional photographers',
    'Instant booking confirmation',
    'Portfolio preview',
    'Secure payment',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="size-7 text-foreground" strokeWidth={1.5} />
              <span className="text-xl font-light tracking-tight">jashnify</span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 hover:bg-secondary rounded-full"
                  title="Login"
                >
                  <LogIn className="size-5" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 hover:bg-secondary rounded-full"
                  title="Register"
                >
                  <UserPlus className="size-5" strokeWidth={1.5} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Fullscreen with large image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with overlay */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1769230385107-bc6eaa7a123e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHx8fHxwcm9mZXNzaW9uYWwlMjB3ZWRkaW5nJTIwcGhvdG9ncmFwaGVyJTIwY2FtZXJhfGVufDF8fHx8MTc3MTA4MjM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Professional Photography"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-extralight tracking-tight mb-8 leading-[1.1]"
          >
            Capture the
            <br />
            <span className="font-light">Moment</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl font-light mb-12 text-white/90 max-w-2xl mx-auto"
          >
            Connect with professional photographers for every occasion
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="bg-white text-black hover:bg-white/90 text-base px-10 h-14 rounded-full font-normal group"
            >
              Get Started
              <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-extralight tracking-tight mb-6">
              For Every Occasion
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              From weddings to corporate events, find the perfect photographer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-light tracking-tight">{category.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-6xl font-extralight tracking-tight mb-8">
                Simple.
                <br />
                Professional.
                <br />
                Seamless.
              </h2>
              <p className="text-xl text-muted-foreground font-light mb-10">
                Book verified professional photographers with ease. No hassle, just beautiful memories.
              </p>

              <div className="space-y-5">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
                      <Check className="size-4 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-lg font-light">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5]"
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762522927402-f390672558d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHx8fHxjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MTA4MjM0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Professional Photography"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            {[
              { number: '500+', label: 'Photographers' },
              { number: '10k+', label: 'Events Covered' },
              { number: '98%', label: 'Satisfaction Rate' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-6xl md:text-7xl font-extralight mb-4">{stat.number}</div>
                <div className="text-lg text-muted-foreground font-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-foreground text-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-7xl font-extralight tracking-tight mb-8">
            Ready to begin?
          </h2>
          <p className="text-xl md:text-2xl font-light mb-12 text-white/80">
            Join thousands who trust Jashnify for their special moments
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="bg-white text-black hover:bg-white/90 text-base px-10 h-14 rounded-full font-normal group"
          >
            Create Free Account
            <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Camera className="size-6 text-foreground" strokeWidth={1.5} />
              <span className="text-lg font-light">jashnify</span>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              &copy; 2026 Jashnify. Capturing moments, creating memories.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
