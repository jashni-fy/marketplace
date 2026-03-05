'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  description: string;
  formatted_price: string;
  base_price?: number;
  pricing_type: string;
  status: string;
  category: {
    id: number;
    name: string;
  };
}

const ServiceManagement = ({ services: initialServices, onServiceUpdate }: any) => {
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_category_id: '',
    base_price: '',
    pricing_type: 'hourly',
    status: 'draft'
  });

  useEffect(() => {
    setServices(initialServices || []);
  }, [initialServices]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategories([
        { id: 1, name: 'Photography' },
        { id: 2, name: 'Videography' },
        { id: 3, name: 'Event Management' },
        { id: 4, name: 'Catering' },
        { id: 5, name: 'Music & Entertainment' }
      ]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const serviceData = {
        service: {
          ...formData,
          base_price: formData.base_price ? parseFloat(formData.base_price) : null,
          service_category_id: parseInt(formData.service_category_id)
        }
      };

      let response;
      if (editingService) {
        response = await apiService.services.update(editingService.id, serviceData);
        setServices(prev => prev.map(s => s.id === editingService.id ? response.data.service : s));
      } else {
        response = await apiService.services.create(serviceData);
        setServices(prev => [...prev, response.data.service]);
      }

      resetForm();
      onServiceUpdate && onServiceUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      service_category_id: service.category?.id?.toString() || '',
      base_price: service.base_price?.toString() || '',
      pricing_type: service.pricing_type,
      status: service.status
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiService.services.delete(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      service_category_id: '',
      base_price: '',
      pricing_type: 'hourly',
      status: 'draft'
    });
    setEditingService(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">Services</h2>
          <p className="text-slate-500 text-xs mt-1">Manage your professional offerings</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="rounded-lg font-bold">
          <Plus className="mr-1.5 size-3.5" /> Add Service
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-white/[0.05] shadow-2xl mb-10 bg-[#16191e] rounded-2xl p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/[0.03]">
                  <h3 className="text-base font-bold text-white uppercase tracking-widest">{editingService ? 'Edit Service' : 'New Service'}</h3>
                  <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full hover:bg-white/[0.05] text-slate-400">
                    <X className="size-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Service Name</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="h-11 rounded-xl bg-background/50 border-white/[0.05] focus-visible:ring-primary/50 text-white"
                        placeholder="e.g. Wedding Photography Pack"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Category</Label>
                      <select
                        name="service_category_id"
                        value={formData.service_category_id}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-xl border border-white/[0.05] bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="" className="bg-[#16191e]">Select category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-[#16191e]">{cat.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Description</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl min-h-[120px] bg-background/50 border-white/[0.05] focus-visible:ring-primary/50 text-white"
                      placeholder="Detail what's included in this service..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Pricing Type</Label>
                      <select
                        name="pricing_type"
                        value={formData.pricing_type}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-xl border border-white/[0.05] bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="hourly" className="bg-[#16191e]">Hourly</option>
                        <option value="package" className="bg-[#16191e]">Package</option>
                        <option value="custom" className="bg-[#16191e]">Custom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Base Price (₹)</Label>
                      <Input
                        type="number"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl bg-background/50 border-white/[0.05] focus-visible:ring-primary/50 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-widest text-slate-400">Status</Label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-xl border border-white/[0.05] bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="draft" className="bg-[#16191e]">Draft</option>
                        <option value="active" className="bg-[#16191e]">Active</option>
                        <option value="inactive" className="bg-[#16191e]">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.03]">
                    <Button type="button" variant="outline" onClick={resetForm} className="rounded-lg font-bold px-8 border-white/[0.05] text-slate-300 hover:bg-white/[0.02]">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-lg font-bold px-8">
                      {loading ? 'Saving...' : 'Save Service'}
                    </Button>
                  </div>
                </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.length > 0 ? (
          services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-5 rounded-xl border border-white/[0.03] bg-[#16191e] hover:border-primary/20 transition-all group flex flex-col cursor-pointer"
            >
                <div className="flex justify-between items-start mb-4">
                  <div className="size-10 rounded-xl bg-white/[0.02] border border-white/[0.03] flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Briefcase className="size-5 text-slate-500 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(service)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                
                <h4 className="text-base font-bold text-white mb-1 tracking-tight group-hover:text-primary transition-colors">{service.name}</h4>
                <p className="text-xs text-slate-400 font-light mb-5 line-clamp-2 leading-relaxed flex-1">{service.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] mt-auto">
                  <div className="text-sm font-bold text-white">{service.formatted_price}</div>
                  <Badge variant={service.status === 'active' ? 'default' : 'outline'} className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border-none ${service.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-white/[0.05] text-slate-400'}`}>
                    {service.status}
                  </Badge>
                </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/[0.03] rounded-2xl">
            <p className="text-slate-500 text-sm">No services found. Start by adding one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
