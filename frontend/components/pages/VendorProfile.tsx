'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../../lib/api';

interface VendorProfileProps {
  params: {
    id: string;
  };
}

interface Vendor {
  id: string;
  business_name: string;
  description: string;
  location: string;
  services: Array<{
    id: string;
    name: string;
    description: string;
    base_price: number;
    pricing_type: string;
  }>;
}

const VendorProfile: React.FC<VendorProfileProps> = ({ params }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVendor();
  }, [params.id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const response = await apiService.vendors.getById(params.id);
      setVendor(response.data.vendor);
    } catch (err) {
      console.error('Error loading vendor:', err);
      setError('Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600">{error || 'The vendor profile you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-profile">
      <div className="container mx-auto px-4 py-8">
        {/* Vendor Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold mb-4">{vendor.business_name}</h1>
          <p className="text-gray-600 mb-4">{vendor.description}</p>
          <p className="text-sm text-gray-500">📍 {vendor.location}</p>
        </div>

        {/* Services */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Services</h2>
          
          {vendor.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.services.map((service) => (
                <div key={service.id} className="border border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ${service.base_price}
                      {service.pricing_type === 'hourly' && '/hr'}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No services available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;