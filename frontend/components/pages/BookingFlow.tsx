'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';

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

  useEffect(() => {
    // Load service details
    const loadService = async () => {
      try {
        // This would fetch service details from API
        setService({
          id: params.serviceId,
          name: 'Sample Service',
          description: 'This is a sample service for booking',
          price: 100
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="booking-flow">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Book Service</h1>
        
        {service && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{service.name}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="text-lg font-bold mb-6">${service.price}</p>
            
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Proceed with Booking
              </button>
              <button 
                onClick={() => router.back()}
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;