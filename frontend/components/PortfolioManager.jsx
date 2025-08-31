import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api';

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Load services for the current vendor
      const servicesResponse = await apiService.services.getAll();
      setServices(servicesResponse.data.services || []);

      // Load portfolio items (when portfolio API is available)
      // For now, we'll use service images as portfolio items
      const allServices = servicesResponse.data.services || [];
      const portfolioItems = [];
      
      allServices.forEach(service => {
        if (service.service_images && service.service_images.length > 0) {
          service.service_images.forEach(image => {
            portfolioItems.push({
              id: `service-${service.id}-image-${image.id}`,
              service_id: service.id,
              service_name: service.name,
              image_url: image.medium_url || image.thumbnail_url,
              title: image.title || service.name,
              description: image.description || service.description,
              is_primary: image.is_primary,
              created_at: service.created_at
            });
          });
        }
      });

      setPortfolioItems(portfolioItems);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    if (!selectedService) {
      setError('Please select a service before uploading images');
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        setError(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        setError(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of validFiles) {
        await uploadImage(file);
      }
      await loadPortfolioData(); // Refresh the portfolio
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('service_id', selectedService);
    formData.append('title', file.name.split('.')[0]);

    // This would use the service images API
    // For now, we'll simulate the upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  const handleDeleteImage = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // For now, just remove from local state
      setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const groupedItems = portfolioItems.reduce((acc, item) => {
    if (!acc[item.service_name]) {
      acc[item.service_name] = [];
    }
    acc[item.service_name].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="portfolio-manager">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-manager space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Portfolio Manager</h2>
          <p className="text-slate-400 text-sm mt-1">Showcase your work and attract more customers</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="card bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
          <span>📤</span> Upload New Images
        </h3>
        
        {/* Service Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Service *
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-slate-700 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose a service...</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2"></div>
              <p className="text-slate-400">Uploading images...</p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📸</div>
              <p className="text-lg font-medium text-slate-50 mb-2">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-slate-400 mb-4">
                Supports JPG, PNG, GIF up to 10MB each
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={!selectedService || uploading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedService && !uploading
                    ? 'btn-primary cursor-pointer'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                Choose Files
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Gallery */}
      <div className="card bg-slate-800 border-slate-700">
        <div className="border-b border-slate-700 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
            <span>🖼️</span> Your Portfolio
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {portfolioItems.length} image{portfolioItems.length !== 1 ? 's' : ''} across {Object.keys(groupedItems).length} service{Object.keys(groupedItems).length !== 1 ? 's' : ''}
          </p>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">📷</div>
            <h3 className="text-lg font-semibold text-slate-50 mb-2">No portfolio images</h3>
            <p className="text-slate-400 text-sm">
              Upload images to showcase your work and attract customers.
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedItems).map(([serviceName, items]) => (
              <div key={serviceName} className="mb-8 last:mb-0">
                <h4 className="text-base font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <span>📸</span>
                  {serviceName}
                  <span className="text-sm text-slate-400 font-normal">({items.length} image{items.length !== 1 ? 's' : ''})</span>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzQ3NTU2OSIvPgo8L3N2Zz4K';
                          }}
                        />
                        {item.is_primary && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleDeleteImage(item.id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Delete image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Image info */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-slate-50 truncate" title={item.title}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-400 truncate" title={item.description}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;