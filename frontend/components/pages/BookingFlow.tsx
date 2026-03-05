'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, IndianRupee, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

interface BookingFlowProps {
  params: {
    serviceId: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Load service details
    const loadService = async () => {
      try {
        // This would fetch service details from API
        setService({
          id: params.serviceId,
          name: 'Premium Wedding Package',
          description: 'Full day coverage, 2 photographers, drone footage, and edited highlight reel.',
          price: 150000
        });
      } catch (error) {
        console.error('Error loading service:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.serviceId) {
      loadService();
    }
  }, [params.serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-foreground font-sans">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </button>

        <div className="space-y-8 animate-in fade-in duration-500">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Complete Your Booking</h1>
            <p className="text-slate-400 text-sm">Review details and secure your professional for the event.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-4 border-b border-white/[0.05] pb-6">
             {[1, 2, 3].map(i => (
                <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-primary' : 'text-slate-600'}`}>
                   <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= i ? 'bg-primary/10 border-primary' : 'border-slate-700'}`}>
                      {step > i ? <CheckCircle2 className="size-3" /> : i}
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                      {i === 1 ? 'Details' : i === 2 ? 'Schedule' : 'Confirm'}
                   </span>
                   {i < 3 && <div className="w-8 h-px bg-white/[0.05] mx-2" />}
                </div>
             ))}
          </div>

          {service && (
            <div className="grid md:grid-cols-5 gap-8">
               <div className="md:col-span-3 space-y-6">
                  {step === 1 && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-lg font-bold text-white mb-4">Event Details</h3>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Event Type</label>
                              <input type="text" className="w-full bg-[#16191e] border border-white/[0.05] rounded-xl h-12 px-4 text-white focus:outline-none focus:border-primary/50" placeholder="e.g. Wedding Reception" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Special Requests</label>
                              <textarea className="w-full bg-[#16191e] border border-white/[0.05] rounded-xl p-4 text-white focus:outline-none focus:border-primary/50 min-h-[120px]" placeholder="Any specific shots or themes in mind?" />
                           </div>
                           <Button onClick={() => setStep(2)} className="w-full h-12 rounded-xl font-bold">Continue to Schedule</Button>
                        </div>
                     </motion.div>
                  )}

                  {step === 2 && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <h3 className="text-lg font-bold text-white mb-4">Schedule</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Date</label>
                              <div className="relative">
                                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                 <input type="date" className="w-full bg-[#16191e] border border-white/[0.05] rounded-xl h-12 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Time</label>
                              <div className="relative">
                                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                 <input type="time" className="w-full bg-[#16191e] border border-white/[0.05] rounded-xl h-12 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]" />
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl border-white/[0.05] hover:bg-white/[0.02]">Back</Button>
                           <Button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl font-bold">Review Booking</Button>
                        </div>
                     </motion.div>
                  )}

                  {step === 3 && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-center py-8">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                           <CheckCircle2 className="size-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Book</h3>
                        <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">By confirming, a request will be sent to the professional. You won't be charged until they accept.</p>
                        <div className="flex gap-3">
                           <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl border-white/[0.05] hover:bg-white/[0.02]">Back</Button>
                           <Button className="flex-1 h-12 rounded-xl font-bold">Confirm Booking</Button>
                        </div>
                     </motion.div>
                  )}
               </div>

               {/* Summary Sidebar */}
               <div className="md:col-span-2">
                  <Card className="bg-[#16191e] border-white/[0.05] sticky top-24">
                     <CardContent className="p-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 pb-4 border-b border-white/[0.05]">Order Summary</h4>
                        <div className="space-y-4 mb-6">
                           <div>
                              <p className="font-bold text-white text-sm mb-1">{service.name}</p>
                              <p className="text-[10px] text-slate-400 leading-relaxed">{service.description}</p>
                           </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-white/[0.05] text-sm font-medium">
                           <div className="flex justify-between text-slate-400">
                              <span>Base Price</span>
                              <span>₹{service.price.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-slate-400">
                              <span>Platform Fee</span>
                              <span>₹{(service.price * 0.05).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/[0.05]">
                              <span>Total</span>
                              <span className="text-primary flex items-center gap-1">
                                 <IndianRupee className="size-4" />
                                 {(service.price * 1.05).toLocaleString()}
                              </span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingFlow;
