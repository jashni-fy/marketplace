import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api';

const ServiceManagement = ({ services: initialServices, onServiceUpdate }) => {
  const [services, setServices] = useState(initialServices || []);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      // This would be implemented when categories API is available
      // For now, using mock data
      setCategories([
        { id: 1, name: 'Photography', slug: 'photography' },
        { id: 2, name: 'Videography', slug: 'videography' },
        { id: 3, name: 'Event Management', slug: 'event-management' },
        { id: 4, name: 'Catering', slug: 'catering' },
        { id: 5, name: 'Music & Entertainment', slug: 'music-entertainment' }
      ]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
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
      } else {
        response = await apiService.services.create(serviceData);
      }

      // Update local state
      if (editingService) {
        setServices(prev => prev.map(s => 
          s.id === editingService.id ? response.data.service : s
        ));
      } else {
        setServices(prev => [...prev, response.data.service]);
      }

      // Reset form
      resetForm();
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.error || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
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

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await apiService.services.delete(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
      onServiceUpdate && onServiceUpdate();
    } catch (err) {
      console.error('Error deleting service:', err);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="service-management space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Service Management</h2>
          <p className="text-slate-400 text-sm mt-1">Create and manage your service offerings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Service
        </button>
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

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  id="service-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label htmlFor="service-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="service-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your service (minimum 50 characters)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="service-category"
                    name="service_category_id"
                    value={formData.service_category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pricing-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Type *
                  </label>
                  <select
                    id="pricing-type"
                    name="pricing_type"
                    value={formData.pricing_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="package">Package</option>
                    <option value="custom">Custom Quote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.pricing_type !== 'custom' && (
                  <div>
                    <label htmlFor="base-price" className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price *
                    </label>
                    <input
                      id="base-price"
                      type="number"
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      required={formData.pricing_type !== 'custom'}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="service-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="service-status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="card bg-slate-800 border-slate-700">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">🛠️</div>
            <h3 className="text-lg font-semibold text-slate-50 mb-2">No services</h3>
            <p className="text-slate-400 text-sm mb-6">Get started by creating your first service.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-50">{service.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        service.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2 line-clamp-2">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <span>📂</span> {service.category?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💰</span> {service.formatted_price}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Edit service"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Delete service"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;