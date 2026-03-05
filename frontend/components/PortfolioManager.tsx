'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Star, 
  Upload, 
  Loader2,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const loadPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.vendors.portfolioItems('me'); 
      setPortfolioItems(response.data.portfolio_items || []);
    } catch (err) {
      console.error('Error loading portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList, portfolioItemId: string | null = null) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      if (portfolioItemId) {
        const formData = new FormData();
        validFiles.forEach(file => formData.append('images[]', file));
        await apiService.portfolioItems.uploadImages(portfolioItemId, validFiles);
      } else {
        const res = await apiService.portfolioItems.create({
          portfolio_item: {
            title: validFiles[0].name.split('.')[0],
            category: selectedCategory || 'General'
          }
        });
        await apiService.portfolioItems.uploadImages(res.data.portfolio_item.id, validFiles);
      }
      loadPortfolioData();
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await apiService.portfolioItems.delete(id);
      loadPortfolioData();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">Portfolio</h2>
          <p className="text-slate-500 text-xs mt-1">Showcase your best work to potential clients</p>
        </div>
        <div className="flex gap-3">
           <Button size="sm" className="rounded-lg font-bold">
             <Plus className="mr-1.5 size-3.5" /> New Collection
           </Button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div 
        className={`border-dashed border-2 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-12 ${
          dragActive ? 'border-primary bg-primary/5' : 'border-white/[0.05] bg-[#16191e] hover:border-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="size-12 rounded-xl bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/[0.03]">
          {uploading ? <Loader2 className="size-5 animate-spin text-primary" /> : <Upload className="size-5 text-slate-400" strokeWidth={2} />}
        </div>
        <h3 className="text-sm font-bold text-white mb-1">
          {uploading ? 'Uploading...' : 'Drop images here'}
        </h3>
        <p className="text-slate-500 text-xs mb-6 text-center max-w-xs">
          High-quality JPG or PNG up to 10MB
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="portfolio-upload"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Button asChild variant="outline" size="sm" className="rounded-lg text-xs cursor-pointer border-white/[0.05] hover:bg-white/[0.02]">
          <label htmlFor="portfolio-upload">Select Files</label>
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {portfolioItems.length > 0 ? (
          portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.03] bg-[#16191e]"
            >
              {item.images && item.images[0] ? (
                <Image 
                  src={item.images[0].url} 
                  alt={item.title} 
                  fill
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0" 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600">
                  <Camera className="size-8 opacity-20" strokeWidth={1.5} />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-white hover:text-primary transition-colors">
                  <Star className="size-3" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-white hover:text-red-400 transition-colors"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="flex justify-between items-end">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{item.image_count || 0} images</p>
                  </div>
                  <Badge variant="secondary" className="text-[8px] px-1.5 py-0 rounded bg-white/10 border-none text-white shrink-0">
                    {item.category}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          !loading && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/[0.03] rounded-2xl">
              <p className="text-slate-500 text-sm">Your portfolio is empty. Add your first collection above.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;