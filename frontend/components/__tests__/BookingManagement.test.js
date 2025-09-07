import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingManagement from '../BookingManagement';
import { api } from '../../lib/api';

// Mock the API
jest.mock('../../lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

describe('BookingManagement', () => {
  const mockBookings = [
    {
      id: 1,
      status: 'pending',
      event_date: '2024-03-15T10:00:00Z',
      event_location: '123 Main St',
      total_amount: 500,
      requirements: 'Test requirements',
      service: { name: 'Photography Session' },
      customer: { name: 'John Doe', email: 'john@example.com' },
      vendor: { name: 'Jane Photographer', business_name: 'Jane Photos' }
    },
    {
      id: 2,
      status: 'accepted',
      event_date: '2024-03-16T14:00:00Z',
      event_location: '456 Oak Ave',
      total_amount: 1200,
      service: { name: 'Video Production' },
      customer: { name: 'Jane Smith', email: 'jane@example.com' },
      vendor: { name: 'Bob Videographer', business_name: 'Bob Videos' }
    },
    {
      id: 3,
      status: 'completed',
      event_date: '2024-03-10T09:00:00Z',
      event_location: '789 Pine St',
      total_amount: 800,
      service: { name: 'Event Photography' },
      customer: { name: 'Mike Johnson', email: 'mike@example.com' },
      vendor: { name: 'Alice Photographer', business_name: 'Alice Studios' }
    }
  ];

  const mockMessages = [
    {
      id: 1,
      message: 'Hello, I have a question about the booking.',
      sent_at: '2024-03-14T10:00:00Z',
      formatted_sent_at: '03/14/2024 at 10:00 AM',
      sender: { id: 1, name: 'John Doe', type: 'customer' }
    },
    {
      id: 2,
      message: 'Sure, what would you like to know?',
      sent_at: '2024-03-14T10:30:00Z',
      formatted_sent_at: '03/14/2024 at 10:30 AM',
      sender: { id: 2, name: 'Jane Photos', type: 'vendor' }
    }
  ];

  beforeEach(() => {
    api.get.mockClear();
    api.post.mockClear();
  });

  it('renders booking management header', () => {
    api.get.mockResolvedValue({ data: { bookings: [] } });
    
    render(<BookingManagement />);
    
    expect(screen.getByText('Booking Management')).toBeInTheDocument();
    expect(screen.getByText('Manage your bookings and communicate with customers')).toBeInTheDocument();
  });

  it('loads bookings on mount', async () => {
    api.get.mockResolvedValue({ data: { bookings: mockBookings } });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/bookings');
    });
  });

  it('displays filter tabs with correct counts', async () => {
    api.get.mockResolvedValue({ data: { bookings: mockBookings } });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('All Bookings (3)')).toBeInTheDocument();
      expect(screen.getByText('Pending (1)')).toBeInTheDocument();
      expect(screen.getByText('Accepted (1)')).toBeInTheDocument();
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
  });

  it('filters bookings by status', async () => {
    api.get.mockResolvedValue({ data: { bookings: mockBookings } });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      // Click on pending filter
      fireEvent.click(screen.getByText('Pending (1)'));
    });
    
    // Should show only pending bookings
    await waitFor(() => {
      expect(screen.getByText('Photography Session')).toBeInTheDocument();
      expect(screen.queryByText('Video Production')).not.toBeInTheDocument();
    });
  });

  it('displays booking cards with correct information', async () => {
    api.get.mockResolvedValue({ data: { bookings: mockBookings } });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      // Check first booking
      expect(screen.getByText('Photography Session')).toBeInTheDocument();
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('shows empty state when no bookings', async () => {
    api.get.mockResolvedValue({ data: { bookings: [] } });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('No bookings found')).toBeInTheDocument();
      expect(screen.getByText("You don't have any bookings yet.")).toBeInTheDocument();
    });
  });

  it('opens message modal when clicking messages button', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bookings') {
        return Promise.resolve({ data: { bookings: mockBookings } });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: { messages: mockMessages } });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      const messagesButtons = screen.getAllByText('Messages');
      fireEvent.click(messagesButtons[0]);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Messages - Photography Session')).toBeInTheDocument();
      expect(screen.getByText('Customer: John Doe')).toBeInTheDocument();
    });
  });

  it('displays messages in modal', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bookings') {
        return Promise.resolve({ data: { bookings: mockBookings } });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: { messages: mockMessages } });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      const messagesButtons = screen.getAllByText('Messages');
      fireEvent.click(messagesButtons[0]);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Hello, I have a question about the booking.')).toBeInTheDocument();
      expect(screen.getByText('Sure, what would you like to know?')).toBeInTheDocument();
    });
  });

  it('sends new message', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bookings') {
        return Promise.resolve({ data: { bookings: mockBookings } });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: { messages: mockMessages } });
      }
      return Promise.resolve({ data: {} });
    });
    
    api.post.mockResolvedValue({
      data: {
        message: {
          id: 3,
          message: 'New test message',
          sent_at: '2024-03-14T11:00:00Z',
          formatted_sent_at: '03/14/2024 at 11:00 AM',
          sender: { id: 2, name: 'Jane Photos', type: 'vendor' }
        }
      }
    });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      const messagesButtons = screen.getAllByText('Messages');
      fireEvent.click(messagesButtons[0]);
    });
    
    await waitFor(() => {
      const messageInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(messageInput, { target: { value: 'New test message' } });
      
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/bookings/1/send_message', {
        message: 'New test message'
      });
    });
  });

  it('handles booking response actions', async () => {
    api.get.mockResolvedValue({ data: { bookings: mockBookings } });
    api.post.mockResolvedValue({
      data: {
        booking: { ...mockBookings[0], status: 'accepted' }
      }
    });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      // Click respond button for pending booking
      const respondButton = screen.getByText('Respond');
      fireEvent.click(respondButton);
    });
    
    await waitFor(() => {
      // Click accept button
      const acceptButton = screen.getByText('Accept');
      fireEvent.click(acceptButton);
    });
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/bookings/1/respond', {
        response_action: 'accept'
      });
    });
  });

  it('handles counter offer', async () => {
    api.get.mockResolvedValue({ data: { bookings: mockBookings } });
    api.post.mockResolvedValue({
      data: {
        booking: { ...mockBookings[0], status: 'counter_offered', total_amount: 600 }
      }
    });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      // Click respond button for pending booking
      const respondButton = screen.getByText('Respond');
      fireEvent.click(respondButton);
    });
    
    await waitFor(() => {
      // Fill counter offer form
      const amountInput = screen.getByLabelText('Amount ($)');
      fireEvent.change(amountInput, { target: { value: '600' } });
      
      const messageInput = screen.getByLabelText('Message');
      fireEvent.change(messageInput, { target: { value: 'Counter offer message' } });
      
      // Click send counter offer button
      const counterButton = screen.getByText('Send Counter Offer');
      fireEvent.click(counterButton);
    });
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/bookings/1/respond', {
        response_action: 'counter_offer',
        counter_amount: '600',
        counter_message: 'Counter offer message'
      });
    });
  });

  it('displays loading state', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<BookingManagement />);
    
    expect(screen.getByText('Loading bookings...')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    api.get.mockRejectedValue(new Error('API Error'));
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load bookings')).toBeInTheDocument();
    });
  });

  it('closes message modal', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bookings') {
        return Promise.resolve({ data: { bookings: mockBookings } });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: { messages: mockMessages } });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<BookingManagement />);
    
    await waitFor(() => {
      const messagesButtons = screen.getAllByText('Messages');
      fireEvent.click(messagesButtons[0]);
    });
    
    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Messages - Photography Session')).not.toBeInTheDocument();
    });
  });
});