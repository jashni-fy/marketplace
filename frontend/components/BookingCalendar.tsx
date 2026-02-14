'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingCalendar = ({ bookings: initialBookings }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState(initialBookings || []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const res = await api.get('/api/availability_slots', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });
      setAvailabilitySlots(res.data.availability_slots || []);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    }
  };

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: (number | null)[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    
    return days;
  };

  const getBookingsForDate = (date: Date | null) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const ds = `${year}-${month}-${day}`;
    return (bookings || []).filter((b: any) => b.event_date?.startsWith(ds));
  };

  const navigateMonth = (step: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + step, 1));
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-light tracking-tight">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)} className="rounded-full border-border">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)} className="rounded-full border-border">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-2xl overflow-hidden shadow-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-secondary p-4 text-center text-xs font-normal uppercase tracking-widest text-muted-foreground">
              {d}
            </div>
          ))}
          {daysInMonth(currentDate).map((day, i) => {
            const currentCellDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
            const dayBookings = getBookingsForDate(currentCellDate);
            return (
              <div
                key={i}
                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`min-h-[120px] p-2 bg-white transition-all cursor-pointer relative group ${
                  !day ? 'bg-secondary/20' : 'hover:bg-secondary/50'
                } ${isSelected(day) ? 'ring-2 ring-inset ring-foreground z-10' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-sm font-light ${isToday(day) ? 'size-7 bg-foreground text-white rounded-full flex items-center justify-center' : ''}`}>
                      {day}
                    </span>
                    <div className="mt-2 space-y-1">
                      {dayBookings.slice(0, 2).map((b: any, idx: number) => (
                        <div key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-foreground/5 border border-border truncate font-light">
                          {b.service_name}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[10px] text-muted-foreground font-light pl-2">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Details */}
      <div className="space-y-8">
        <h3 className="text-2xl font-light tracking-tight">Details</h3>
        {selectedDate ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground font-light mb-1">
                  {selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                </p>
                <p className="text-2xl font-light">
                  {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-normal uppercase tracking-widest text-muted-foreground">Bookings</h4>
                {getBookingsForDate(selectedDate).length > 0 ? (
                  getBookingsForDate(selectedDate).map((b: any) => (
                    <Card key={b.id} className="border-border shadow-sm group hover:border-foreground transition-colors">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="font-normal">{b.service_name}</div>
                          <Badge variant="secondary" className="rounded-full text-[10px] font-normal uppercase">{b.status}</Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground font-light">
                          <div className="flex items-center gap-2"><User className="size-3" /> {b.customer_name}</div>
                          <div className="flex items-center gap-2"><Clock className="size-3" /> {b.start_time}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-border rounded-2xl">
                    <p className="text-sm text-muted-foreground font-light">No events scheduled</p>
                  </div>
                )}
              </div>

              <Button className="w-full rounded-full h-12 font-normal text-white">
                <Plus className="mr-2 size-4" /> Add Availability
              </Button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center text-muted-foreground font-light">
            Select a date to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
