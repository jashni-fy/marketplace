import React, { useState, useEffect } from 'react';

const BookingCalendar = ({ bookings: initialBookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState(initialBookings || []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
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
    loadAvailabilitySlots();
  }, [currentDate]);

  const loadAvailabilitySlots = async () => {
    // This would load availability slots from the API when implemented
    // For now, using mock data
    const mockSlots = [
      {
        id: 1,
        date: '2024-03-15',
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      },
      {
        id: 2,
        date: '2024-03-16',
        start_time: '10:00',
        end_time: '16:00',
        is_available: true
      }
    ];
    setAvailabilitySlots(mockSlots);
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

  const handleSaveAvailability = () => {
    // This would save to the API when implemented
    const newAvailabilitySlot = {
      id: Date.now(),
      ...newSlot
    };
    
    setAvailabilitySlots(prev => [
      ...prev.filter(slot => slot.date !== newSlot.date),
      newAvailabilitySlot
    ]);
    
    setShowAvailabilityModal(false);
    setNewSlot({
      date: '',
      start_time: '',
      end_time: '',
      is_available: true
    });
  };

  const handleRemoveAvailability = (date) => {
    const dateString = date.toISOString().split('T')[0];
    setAvailabilitySlots(prev => prev.filter(slot => slot.date !== dateString));
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                              className={`text-xs px-1 py-0.5 rounded mb-1 truncate ${getStatusColor(booking.status)}`}
                              title={`${booking.service_name} - ${booking.status}`}
                            >
                              {booking.service_name}
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
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm font-medium">{booking.service_name}</p>
                              <p className="text-xs text-gray-600">{booking.customer_name}</p>
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
    </div>
  );
};

export default BookingCalendar;