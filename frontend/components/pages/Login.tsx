'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Github, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(formData);

    if (result.success) {
      router.push(from);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-background flex overflow-hidden font-sans text-foreground">
      <AuthLeftPanel />

      {/* Right Panel */}
      <div className="flex-1 lg:w-[55%] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Ambient Orb */}
        <div className="absolute top-[-15%] right-[-15%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Mobile Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex items-center gap-2 mb-8"
        >
          <div className="p-2 rounded-lg bg-primary/20">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-white">jashnify</span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 max-w-md"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-base">
            Sign in to start exploring services
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8 shadow-2xl shadow-black/40 w-full max-w-md relative z-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <svg className="w-4 h-4 text-destructive shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <Label htmlFor="email" className="text-foreground/80 font-semibold mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-11 h-10 bg-background/60 border-border/50 rounded-xl focus-visible:ring-primary/40"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="text-foreground/80 font-semibold">
                    Password
                  </Label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="pl-11 pr-10 h-10 bg-background/60 border-border/50 rounded-xl focus-visible:ring-primary/40"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl font-bold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="glow-separator" />
            <span className="mx-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest shrink-0">Or continue with</span>
            <div className="glow-separator" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-10 rounded-lg gap-2 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-10 rounded-lg gap-2 text-sm">
              <Github className="w-4 h-4" />
              Github
            </Button>
          </div>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-muted-foreground text-sm"
        >
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-primary font-bold hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
          >
            Create one here
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Login;
