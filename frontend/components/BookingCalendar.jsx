import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const BookingCalendar = ({ bookings: initialBookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState(initialBookings || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    end_time: '',
    is_available: true
  });

  useEffect(() => {
    setBookings(initialBookings || []);
  }, [initialBookings]);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadBookings(),
        loadAvailabilitySlots()
      ]);
    } catch (err) {
      setError('Failed to load calendar data');
      console.error('Calendar data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings');
      if (response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const loadAvailabilitySlots = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await api.get('/availability_slots', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });
      
      if (response.data.availability_slots) {
        setAvailabilitySlots(response.data.availability_slots);
      }
    } catch (err) {
      console.error('Failed to load availability slots:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.event_date && booking.event_date.startsWith(dateString)
    );
  };

  const getAvailabilityForDate = (date) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    return availabilitySlots.find(slot => slot.date === dateString);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    if (!date || isPastDate(date)) return;
    setSelectedDate(date);
  };

  const handleAddAvailability = () => {
    if (!selectedDate) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    setNewSlot({
      date: dateString,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true
    });
    setShowAvailabilityModal(true);
  };

  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.post('/availability_slots', {
        availability_slot: newSlot
      });
      
      if (response.data.availability_slot) {
        setAvailabilitySlots(prev => [
          ...prev.filter(slot => slot.date !== newSlot.date),
          response.data.availability_slot
        ]);
        
        setShowAvailabilityModal(false);
        setNewSlot({
          date: '',
          start_time: '',
          end_time: '',
          is_available: true
        });
      }
    } catch (err) {
      setError('Failed to save availability');
      console.error('Save availability error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvailability = async (date) => {
    const dateString = date.toISOString().split('T')[0];
    const slot = availabilitySlots.find(s => s.date === dateString);
    
    if (!slot) return;
    
    try {
      setLoading(true);
      await api.delete(`/availability_slots/${slot.id}`);
      setAvailabilitySlots(prev => prev.filter(s => s.id !== slot.id));
    } catch (err) {
      setError('Failed to remove availability');
      console.error('Remove availability error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleBookingResponse = async (bookingId, action, data = {}) => {
    try {
      setLoading(true);
      const response = await api.post(`/bookings/${bookingId}/respond`, {
        response_action: action,
        ...data
      });
      
      if (response.data.booking) {
        // Update the booking in the list
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? response.data.booking : b
        ));
        
        // Update selected booking if it's the same one
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking(response.data.booking);
        }
      }
    } catch (err) {
      setError('Failed to respond to booking');
      console.error('Booking response error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };



  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="booking-calendar">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Booking Calendar</h2>
          <p className="text-gray-600 mt-1">Manage your availability and view bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((date, index) => {
                  const dayBookings = getBookingsForDate(date);
                  const availability = getAvailabilityForDate(date);
                  const isDateToday = isToday(date);
                  const isDatePast = isPastDate(date);
                  const isSelected = selectedDate && date && 
                    selectedDate.toDateString() === date.toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border border-gray-200 cursor-pointer transition-colors ${
                        !date ? 'bg-gray-50' :
                        isDatePast ? 'bg-gray-100 cursor-not-allowed' :
                        isSelected ? 'bg-blue-100 border-blue-300' :
                        isDateToday ? 'bg-blue-50 border-blue-200' :
                        'hover:bg-gray-50'
                      }`}
                      onClick={() => handleDateClick(date)}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isDatePast ? 'text-gray-400' :
                            isDateToday ? 'text-blue-600' :
                            'text-gray-900'
                          }`}>
                            {date.getDate()}
                          </div>
                          
                          {/* Availability indicator */}
                          {availability && (
                            <div className="w-2 h-2 bg-green-400 rounded-full mb-1"></div>
                          )}
                          
                          {/* Booking indicators */}
                          {dayBookings.slice(0, 2).map((booking, idx) => (
                            <div
                              key={idx}
                              className={`text-xs px-1 py-0.5 rounded mb-1 truncate cursor-pointer ${getStatusColor(booking.status)}`}
                              title={`${booking.service?.name || booking.service_name} - ${booking.status}`}
                              onClick={() => handleBookingClick(booking)}
                            >
                              {booking.service?.name || booking.service_name}
                            </div>
                          ))}
                          
                          {dayBookings.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayBookings.length - 2} more
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          {selectedDate && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              
              {/* Availability for selected date */}
              {(() => {
                const availability = getAvailabilityForDate(selectedDate);
                const dayBookings = getBookingsForDate(selectedDate);
                
                return (
                  <div className="space-y-3">
                    {availability ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Available</p>
                            <p className="text-sm text-green-600">
                              {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveAvailability(selectedDate)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove availability"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm text-gray-600 mb-2">No availability set</p>
                        <button
                          onClick={handleAddAvailability}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Add Availability
                        </button>
                      </div>
                    )}
                    
                    {/* Bookings for selected date */}
                    {dayBookings.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Bookings</p>
                        <div className="space-y-2">
                          {dayBookings.map((booking, idx) => (
                            <div 
                              key={idx} 
                              className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                              onClick={() => handleBookingClick(booking)}
                            >
                              <p className="text-sm font-medium">{booking.service?.name || booking.service_name}</p>
                              <p className="text-xs text-gray-600">{booking.customer?.name || booking.customer_name}</p>
                              <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Legend */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-semibold mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                <span>Pending booking</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                <span>Confirmed booking</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                <span>Completed booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Set Availability</h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvailability}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
          }}
          onRespond={handleBookingResponse}
          loading={loading}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Booking Detail Modal Component
const BookingDetailModal = ({ booking, onClose, onRespond, loading }) => {
  const [counterAmount, setCounterAmount] = useState(booking.total_amount);
  const [counterMessage, setCounterMessage] = useState('');
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  const handleAccept = () => {
    onRespond(booking.id, 'accept');
  };

  const handleDecline = () => {
    onRespond(booking.id, 'decline');
  };

  const handleCounterOffer = () => {
    onRespond(booking.id, 'counter_offer', {
      counter_amount: counterAmount,
      counter_message: counterMessage
    });
    setShowCounterOffer(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Booking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700">Service</h4>
              <p>{booking.service?.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Customer</h4>
              <p>{booking.customer?.name}</p>
              <p className="text-sm text-gray-600">{booking.customer?.email}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Event Date</h4>
              <p>{formatDate(booking.event_date)}</p>
              {booking.event_end_date && (
                <p className="text-sm text-gray-600">
                  Until: {formatDate(booking.event_end_date)}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Location</h4>
              <p>{booking.event_location}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Amount</h4>
              <p className="text-lg font-semibold">${booking.total_amount}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Status</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Requirements */}
          {booking.requirements && (
            <div>
              <h4 className="font-semibold text-gray-700">Requirements</h4>
              <p className="text-gray-600">{booking.requirements}</p>
            </div>
          )}

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div>
              <h4 className="font-semibold text-gray-700">Special Instructions</h4>
              <p className="text-gray-600">{booking.special_instructions}</p>
            </div>
          )}

          {/* Response Actions */}
          {booking.status === 'pending' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Respond to Booking</h4>
              
              {!showCounterOffer ? (
                <div className="flex space-x-3">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => setShowCounterOffer(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Counter Offer
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Counter Amount ($)
                    </label>
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain your counter offer..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCounterOffer}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send Counter Offer
                    </button>
                    <button
                      onClick={() => setShowCounterOffer(false)}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors (moved outside component to avoid recreation)
const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'counter_offered':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default BookingCalendar;