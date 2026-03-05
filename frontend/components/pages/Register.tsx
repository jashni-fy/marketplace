'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Camera, Lock, Mail, User, ArrowRight, CheckCircle, Briefcase, Sparkles } from "lucide-react";

const Register = () => {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
    firstName: '',
    lastName: '',
    role: initialRole,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirmation) {
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.passwordConfirmation,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role,
      vendor_profile_attributes: formData.role === 'vendor' ? {
        business_name: `${formData.firstName} ${formData.lastName}'s Business`,
        location: 'Not specified'
      } : undefined
    });

    if (result.success) {
      if (result.message && result.message.includes('confirm')) {
        alert('Registration successful! Please check your email to confirm your account, then log in.');
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-foreground">
      {/* Dynamic Background Elements - Glassmorphism Support */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-xl w-full relative z-10 mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 shadow-xl shadow-primary/20 mb-6 transform hover:scale-105 transition-transform duration-300 ring-4 ring-primary/10">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-foreground tracking-tight mb-2">
            Join Jashnify
          </h2>
          <p className="text-slate-400 text-lg">
            Create an account to start your journey
          </p>
        </div>

        {/* Main Card - Glassmorphism */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-8 transform transition-all hover:shadow-primary/5 duration-500 relative overflow-hidden">
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${formData.role === 'customer'
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                  : 'bg-background/40 border-border/50 hover:border-primary/30 hover:bg-primary/5'
                  }`}
              >
                <div className={`p-3 rounded-full transition-colors ${formData.role === 'customer' ? 'bg-primary text-white' : 'bg-secondary text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className={`font-bold text-lg ${formData.role === 'customer' ? 'text-white' : 'text-slate-400'}`}>Customer</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Book Services</div>
                </div>
                {formData.role === 'customer' && (
                  <div className="absolute top-3 right-3 text-primary">
                    <CheckCircle className="w-5 h-5 fill-primary/20" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('vendor')}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${formData.role === 'vendor'
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                  : 'bg-background/40 border-border/50 hover:border-primary/30 hover:bg-primary/5'
                  }`}
              >
                <div className={`p-3 rounded-full transition-colors ${formData.role === 'vendor' ? 'bg-primary text-white' : 'bg-secondary text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className={`font-bold text-lg ${formData.role === 'vendor' ? 'text-white' : 'text-slate-400'}`}>Vendor</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Provide Services</div>
                </div>
                {formData.role === 'vendor' && (
                  <div className="absolute top-3 right-3 text-primary">
                    <CheckCircle className="w-5 h-5 fill-primary/20" />
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 shadow-sm hover:bg-background/80"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 shadow-sm hover:bg-background/80"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 shadow-sm hover:bg-background/80"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 shadow-sm hover:bg-background/80"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    name="passwordConfirmation"
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 shadow-sm hover:bg-background/80"
                    placeholder="Confirm password"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative group overflow-hidden bg-primary hover:bg-primary/90 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 origin-left" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center mt-8 text-slate-500 font-medium">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-bold hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
