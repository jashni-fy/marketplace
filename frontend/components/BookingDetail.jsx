import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const BookingDetail = ({ bookingId, onClose, onUpdate }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      loadMessages();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      if (response.data.booking) {
        setBooking(response.data.booking);
        setEditForm({
          event_date: response.data.booking.event_date?.split('T')[0] || '',
          event_time: response.data.booking.event_date ? 
            new Date(response.data.booking.event_date).toTimeString().slice(0, 5) : '',
          event_end_date: response.data.booking.event_end_date?.split('T')[0] || '',
          event_end_time: response.data.booking.event_end_date ? 
            new Date(response.data.booking.event_end_date).toTimeString().slice(0, 5) : '',
          event_location: response.data.booking.event_location || '',
          requirements: response.data.booking.requirements || '',
          special_instructions: response.data.booking.special_instructions || '',
          event_duration: response.data.booking.event_duration || ''
        });
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Load booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}/messages`);
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Combine date and time for event_date
      const eventDateTime = editForm.event_date && editForm.event_time ? 
        new Date(`${editForm.event_date}T${editForm.event_time}`) : null;
      
      const eventEndDateTime = editForm.event_end_date && editForm.event_end_time ? 
        new Date(`${editForm.event_end_date}T${editForm.event_end_time}`) : null;

      const updateData = {
        event_date: eventDateTime?.toISOString(),
        event_end_date: eventEndDateTime?.toISOString(),
        event_location: editForm.event_location,
        requirements: editForm.requirements,
        special_instructions: editForm.special_instructions,
        event_duration: editForm.event_duration
      };

      const response = await api.put(`/bookings/${bookingId}`, {
        booking: updateData
      });

      if (response.data.booking) {
        setBooking(response.data.booking);
        setIsEditing(false);
        onUpdate?.(response.data.booking);
      }
    } catch (err) {
      setError('Failed to update booking');
      console.error('Update booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setLoading(true);
      await api.delete(`/bookings/${bookingId}`);
      onUpdate?.({ ...booking, status: 'cancelled' });
      onClose?.();
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Cancel booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/bookings/${bookingId}/send_message`, {
        message: newMessage
      });
      
      if (response.data.message) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'counter_offered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !booking) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading booking details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Booking Details</h2>
            <p className="text-gray-600">#{booking.id}</p>
          </div>
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

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'details', label: 'Details' },
              { key: 'messages', label: `Messages (${messages.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Status and Actions */}
            <div className="flex justify-between items-center">
              <span className={`px-4 py-2 rounded-full text-sm border ${getStatusColor(booking.status)}`}>
                {booking.status.replace('_', ' ').toUpperCase()}
              </span>
              
              <div className="flex space-x-3">
                {booking.can_be_modified && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Booking
                  </button>
                )}
                
                {booking.can_be_cancelled && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            {/* Booking Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Service Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Service:</span>
                    <p className="text-gray-900">{booking.service?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    <p className="text-gray-900">{booking.service?.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Vendor:</span>
                    <p className="text-gray-900">{booking.vendor?.business_name || booking.vendor?.name}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">{booking.customer?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{booking.customer?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Event Details</h3>
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date & Time
                  </label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={editForm.event_date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, event_date: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={editForm.event_time}
                        onChange={(e) => setEditForm(prev => ({ ...prev, event_time: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900">{formatDate(booking.event_date)}</p>
                  )}
                </div>

                {/* Event End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time (Optional)
                  </label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={editForm.event_end_date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, event_end_date: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={editForm.event_end_time}
                        onChange={(e) => setEditForm(prev => ({ ...prev, event_end_time: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900">{formatDate(booking.event_end_date)}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.event_location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, event_location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{booking.event_location}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.event_duration}
                      onChange={(e) => setEditForm(prev => ({ ...prev, event_duration: e.target.value }))}
                      placeholder="e.g., 4 hours, All day"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{booking.event_duration || booking.duration_hours ? `${booking.duration_hours} hours` : 'Not specified'}</p>
                  )}
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <p className="text-2xl font-bold text-green-600">${booking.total_amount}</p>
                </div>
              </div>

              {/* Requirements */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.requirements}
                    onChange={(e) => setEditForm(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{booking.requirements || 'No specific requirements'}</p>
                )}
              </div>

              {/* Special Instructions */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.special_instructions}
                    onChange={(e) => setEditForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{booking.special_instructions || 'No special instructions'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {/* Messages List */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.type === 'vendor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.type === 'vendor'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{message.sender.name}</p>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender.type === 'vendor' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.formatted_sent_at}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;