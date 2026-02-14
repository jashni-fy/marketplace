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
    <div className="min-h-screen w-full bg-[#FAF5FF] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-900">
      {/* Dynamic Background Elements - Glassmorphism Support */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-400/30 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-teal-300/30 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-xl w-full relative z-10 mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/20 mb-6 transform hover:scale-105 transition-transform duration-300 ring-4 ring-white/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Join Jashnify
          </h2>
          <p className="text-slate-500 text-lg">
            Create an account to start your journey
          </p>
        </div>

        {/* Main Card - Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 transform transition-all hover:shadow-emerald-500/10 duration-500 relative overflow-hidden">
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/40 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
              >
                <div className={`p-3 rounded-full transition-colors ${formData.role === 'customer' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-500'}`}>
                  <User className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className={`font-bold text-lg ${formData.role === 'customer' ? 'text-emerald-900' : 'text-slate-600'}`}>Customer</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Book Services</div>
                </div>
                {formData.role === 'customer' && (
                  <div className="absolute top-3 right-3 text-emerald-500">
                    <CheckCircle className="w-5 h-5 fill-emerald-100" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('vendor')}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${formData.role === 'vendor'
                  ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/40 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
              >
                <div className={`p-3 rounded-full transition-colors ${formData.role === 'vendor' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-500'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className={`font-bold text-lg ${formData.role === 'vendor' ? 'text-emerald-900' : 'text-slate-600'}`}>Vendor</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Provide Services</div>
                </div>
                {formData.role === 'vendor' && (
                  <div className="absolute top-3 right-3 text-emerald-500">
                    <CheckCircle className="w-5 h-5 fill-emerald-100" />
                  </div>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:bg-white/80"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:bg-white/80"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:bg-white/80"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:bg-white/80"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    name="passwordConfirmation"
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:bg-white/80"
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
              className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 origin-left" />
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
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
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
