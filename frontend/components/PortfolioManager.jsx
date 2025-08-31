import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api';

const PortfolioManager = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio items using the new API
      const response = await apiService.get('/api/v1/portfolio_items');
      setPortfolioItems(response.data.portfolio_items || []);
      setCategories(response.data.categories || []);
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

  const handleFiles = async (files, portfolioItemId = null) => {
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
      if (portfolioItemId) {
        // Upload to existing portfolio item
        await uploadImagesToPortfolioItem(portfolioItemId, validFiles);
      } else {
        // Create new portfolio item with images
        await createPortfolioItemWithImages(validFiles);
      }
      await loadPortfolioData(); // Refresh the portfolio
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const uploadImagesToPortfolioItem = async (portfolioItemId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images[]', file);
    });

    const response = await apiService.post(`/api/v1/portfolio_items/${portfolioItemId}/upload_images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  const createPortfolioItemWithImages = async (files) => {
    // First create the portfolio item
    const portfolioData = {
      title: files[0].name.split('.')[0],
      description: '',
      category: selectedCategory || 'general',
      display_order: portfolioItems.length + 1,
      is_featured: false
    };

    const createResponse = await apiService.post('/api/v1/portfolio_items', {
      portfolio_item: portfolioData
    });

    const portfolioItem = createResponse.data.portfolio_item;

    // Then upload images to it
    await uploadImagesToPortfolioItem(portfolioItem.id, files);
  };

  const handleDeletePortfolioItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      await apiService.delete(`/api/v1/portfolio_items/${itemId}`);
      await loadPortfolioData();
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
      setError('Failed to delete portfolio item');
    }
  };

  const handleToggleFeatured = async (itemId, currentStatus) => {
    try {
      await apiService.patch('/api/v1/portfolio_items/set_featured', {
        item_ids: [itemId],
        featured: !currentStatus
      });
      await loadPortfolioData();
    } catch (err) {
      console.error('Error updating featured status:', err);
      setError('Failed to update featured status');
    }
  };

  const handleCreatePortfolioItem = async (formData) => {
    try {
      await apiService.post('/api/v1/portfolio_items', {
        portfolio_item: formData
      });
      setShowCreateForm(false);
      await loadPortfolioData();
    } catch (err) {
      console.error('Error creating portfolio item:', err);
      setError('Failed to create portfolio item');
    }
  };

  const groupedItems = portfolioItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
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
        
        {/* Category Selection */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose category...</option>
              <option value="photography">Photography</option>
              <option value="videography">Videography</option>
              <option value="event_planning">Event Planning</option>
              <option value="catering">Catering</option>
              <option value="music">Music</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              Create Portfolio Item
            </button>
          </div>
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
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !uploading
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
            {portfolioItems.length} portfolio item{portfolioItems.length !== 1 ? 's' : ''} across {Object.keys(groupedItems).length} categor{Object.keys(groupedItems).length !== 1 ? 'ies' : 'y'}
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
            {Object.entries(groupedItems).map(([categoryName, items]) => (
              <div key={categoryName} className="mb-8 last:mb-0">
                <h4 className="text-base font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <span>📸</span>
                  {categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('_', ' ')}
                  <span className="text-sm text-slate-400 font-normal">({items.length} item{items.length !== 1 ? 's' : ''})</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="bg-slate-700 rounded-lg overflow-hidden group">
                      {/* Portfolio Item Header */}
                      <div className="p-4 border-b border-slate-600">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-50 truncate">{item.title}</h5>
                            {item.description && (
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {item.is_featured && (
                              <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-medium">
                                Featured
                              </span>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                                className="bg-yellow-500 text-black p-1 rounded hover:bg-yellow-600 transition-colors"
                                title={item.is_featured ? "Remove from featured" : "Mark as featured"}
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePortfolioItem(item.id)}
                                className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                                title="Delete portfolio item"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Images Grid */}
                      <div className="p-4">
                        {item.images && item.images.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {item.images.slice(0, 4).map((image, index) => (
                              <div key={image.id} className="aspect-square bg-slate-600 rounded overflow-hidden relative">
                                <img
                                  src={image.thumbnail_url || image.url}
                                  alt={image.filename}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzM0MTU1Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iIzQ3NTU2OSIvPgo8L3N2Zz4K';
                                  }}
                                />
                                {index === 3 && item.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white font-medium">+{item.images.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-500 transition-colors"
                            onClick={() => document.getElementById(`file-upload-${item.id}`).click()}
                          >
                            <div className="text-4xl mb-2">📷</div>
                            <p className="text-sm text-slate-400">Click to add images</p>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFiles(e.target.files, item.id)}
                              className="hidden"
                              id={`file-upload-${item.id}`}
                            />
                          </div>
                        )}
                        
                        {item.images && item.images.length > 0 && (
                          <div className="mt-3 text-center">
                            <label
                              htmlFor={`file-upload-${item.id}`}
                              className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer"
                            >
                              Add more images ({item.image_count} total)
                            </label>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFiles(e.target.files, item.id)}
                              className="hidden"
                              id={`file-upload-${item.id}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Portfolio Item Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Create Portfolio Item</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreatePortfolioItem({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                  display_order: portfolioItems.length + 1,
                  is_featured: formData.get('is_featured') === 'on'
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      rows="3"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                    <select
                      name="category"
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="photography">Photography</option>
                      <option value="videography">Videography</option>
                      <option value="event_planning">Event Planning</option>
                      <option value="catering">Catering</option>
                      <option value="music">Music</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      id="is_featured"
                      className="mr-2"
                    />
                    <label htmlFor="is_featured" className="text-sm text-slate-300">Mark as featured</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManager;