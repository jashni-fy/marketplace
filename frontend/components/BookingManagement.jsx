import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      if (response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Load bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/messages`);
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    }
  };

  const handleBookingResponse = async (bookingId, action, data = {}) => {
    try {
      setLoading(true);
      const response = await api.post(`/bookings/${bookingId}/respond`, {
        response_action: action,
        ...data
      });
      
      if (response.data.booking) {
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? response.data.booking : b
        ));
        
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

  const handleSendMessage = async (bookingId) => {
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

  const openMessageModal = async (booking) => {
    setSelectedBooking(booking);
    setShowMessageModal(true);
    await loadMessages(booking.id);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="booking-management">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <p className="text-gray-600 mt-1">Manage your bookings and communicate with customers</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Bookings', count: bookings.length },
              { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { key: 'accepted', label: 'Accepted', count: bookings.filter(b => b.status === 'accepted').length },
              { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any bookings yet." 
              : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onRespond={handleBookingResponse}
              onMessage={() => openMessageModal(booking)}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedBooking && (
        <MessageModal
          booking={selectedBooking}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedBooking(null);
            setMessages([]);
            setNewMessage('');
          }}
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
    </div>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onRespond, onMessage, getStatusColor, formatDate, loading }) => {
  const [showActions, setShowActions] = useState(false);
  const [counterAmount, setCounterAmount] = useState(booking.total_amount);
  const [counterMessage, setCounterMessage] = useState('');

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
    setShowActions(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold">{booking.service?.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-600 mb-1">Customer: {booking.customer?.name}</p>
          <p className="text-gray-600 mb-1">Date: {formatDate(booking.event_date)}</p>
          <p className="text-gray-600 mb-1">Location: {booking.event_location}</p>
          <p className="text-lg font-semibold text-green-600">${booking.total_amount}</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onMessage}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Messages
          </button>
          
          {booking.status === 'pending' && (
            <button
              onClick={() => setShowActions(!showActions)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Respond
            </button>
          )}
        </div>
      </div>

      {/* Requirements */}
      {booking.requirements && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-1">Requirements:</h4>
          <p className="text-gray-600 text-sm">{booking.requirements}</p>
        </div>
      )}

      {/* Response Actions */}
      {showActions && booking.status === 'pending' && (
        <div className="border-t pt-4 mt-4">
          <div className="flex space-x-3 mb-4">
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
          </div>
          
          {/* Counter Offer Form */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-700 mb-3">Counter Offer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
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
                  Message
                </label>
                <input
                  type="text"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="Explain your counter offer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-3">
              <button
                onClick={handleCounterOffer}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Send Counter Offer
              </button>
              <button
                onClick={() => setShowActions(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Message Modal Component
const MessageModal = ({ booking, messages, newMessage, setNewMessage, onSendMessage, onClose }) => {
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(booking.id);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Messages - {booking.service?.name}</h3>
            <p className="text-sm text-gray-600">Customer: {booking.customer?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4">
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
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender.type === 'vendor' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.formatted_sent_at}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingManagement;