'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  Upload, 
  X,
  Grid,
  Loader2,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await apiService.vendors.portfolioItems('me'); // Assuming an endpoint for current vendor
      // If endpoint doesn't exist, we might need to adjust lib/api.js
      setPortfolioItems(response.data.portfolio_items || []);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      // Fallback or error
    } finally {
      setLoading(false);
    }
  };

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
        // Create new item first then upload
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
    if (!window.confirm('Delete this item?')) return;
    try {
      await apiService.portfolioItems.delete(id);
      loadPortfolioData();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-light tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground font-light text-sm">Showcase your best work to potential clients</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={() => setShowCreateForm(true)} className="rounded-full font-light border-border">
             <Plus className="mr-2 size-4" /> New Collection
           </Button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <Card 
        className={`border-dashed border-2 transition-all duration-300 ${
          dragActive ? 'border-foreground bg-secondary/50' : 'border-border bg-transparent'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-12 text-center">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            {uploading ? <Loader2 className="size-8 animate-spin text-muted-foreground" /> : <Upload className="size-8 text-muted-foreground" strokeWidth={1} />}
          </div>
          <h3 className="text-xl font-light mb-2">
            {uploading ? 'Uploading your work...' : 'Drag and drop your images'}
          </h3>
          <p className="text-muted-foreground font-light mb-8 max-w-xs mx-auto">
            Add high-quality photos to your portfolio. Supports JPG, PNG up to 10MB.
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="portfolio-upload"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <Button asChild className="rounded-full px-8 font-normal text-white cursor-pointer">
            <label htmlFor="portfolio-upload">Select Files</label>
          </Button>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolioItems.length > 0 ? (
          portfolioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-border shadow-sm overflow-hidden group bg-white">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  {item.images && item.images[0] ? (
                    <img 
                      src={item.images[0].url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <Camera className="size-10 opacity-20" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white hover:text-black">
                      <Star className="size-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDelete(item.id)}
                      className="rounded-full bg-white/10 border-white/20 text-white hover:bg-destructive hover:text-white"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-normal truncate max-w-[150px]">{item.title}</h4>
                      <p className="text-xs text-muted-foreground font-light">{item.image_count || 0} images</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full font-normal text-[10px] uppercase tracking-wider">
                      {item.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          !loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground font-light">Your portfolio is empty. Add your first collection above.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;
