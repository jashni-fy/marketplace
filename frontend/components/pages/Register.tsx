'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Camera, Lock, Mail, User } from "lucide-react";

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
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 overflow-hidden">
        {/* Background Hero */}
        <div className="absolute inset-0 -z-10">
          <img
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1600&auto=format&fit=crop"
              alt="Event Background"
              className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" /> {/* Dark overlay */}
        </div>

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl  flex-center-col">
          <div className="text-center mb-8 flex-center-col">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-400/30 mx-auto mb-4">
              <Camera className="w-7 h-7 text-emerald-400"/>
            </div>
            <h2 className="text-2xl font-bold">Join Jashnify</h2>
            <p className="text-sm text-slate-400">
              Book & provide services for your events
            </p>
          </div>

          <form className="space-y-4 flex-center-col" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded text-xs">
                  {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="pl-9 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="pl-9 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-9 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-9 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  required
                  className="pl-9 w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="customer">Find & Book Services</option>
              <option value="vendor">Provide Your Services</option>
            </select>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition font-medium flex items-center justify-center text-sm text-white shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
              ) : (
                  "Create Account"
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-5">
            Already have an account?{" "}
            <Link
                href="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
  );
};

export default Register;
