import React from 'react';
import { useParams } from 'react-router-dom';

const BookingFlow = () => {
  const { serviceId } = useParams();

  return (
    <div className="booking-flow">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Book Service</h1>
        <p className="text-gray-600">
          This page will contain the booking flow for service ID: {serviceId} (to be implemented in future tasks).
        </p>
      </div>
    </div>
  );
};

export default BookingFlow;