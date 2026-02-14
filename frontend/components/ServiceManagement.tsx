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
      service_category_id: service.category.id.toString(),
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-light tracking-tight">Services</h2>
          <p className="text-muted-foreground font-light text-sm">Manage your professional offerings</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-full font-normal text-white">
          <Plus className="mr-2 size-4" /> Add Service
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
            <Card className="border-border shadow-sm mb-10 bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-light">{editingService ? 'Edit Service' : 'New Service'}</h3>
                  <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full">
                    <X className="size-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-normal text-sm">Service Name</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="h-11 rounded-xl"
                        placeholder="e.g. Wedding Photography Pack"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-normal text-sm">Category</Label>
                      <select
                        name="service_category_id"
                        value={formData.service_category_id}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-normal text-sm">Description</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl min-h-[120px]"
                      placeholder="Detail what's included in this service..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="font-normal text-sm">Pricing Type</Label>
                      <select
                        name="pricing_type"
                        value={formData.pricing_type}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="package">Package</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-normal text-sm">Base Price (₹)</Label>
                      <Input
                        type="number"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-normal text-sm">Status</Label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={resetForm} className="rounded-full font-light px-8">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-full font-normal px-8 text-white">
                      {loading ? 'Saving...' : 'Save Service'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.length > 0 ? (
          services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-border shadow-sm hover:shadow-md transition-all group bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Briefcase className="size-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="size-8 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-normal tracking-tight mb-2">{service.name}</h4>
                  <p className="text-sm text-muted-foreground font-light mb-6 line-clamp-2">{service.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-lg font-light">{service.formatted_price}</div>
                    <Badge variant={service.status === 'active' ? 'secondary' : 'outline'} className="rounded-full font-normal capitalize">
                      {service.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground font-light">No services found. Start by adding one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
