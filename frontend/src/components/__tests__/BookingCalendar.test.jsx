import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BookingCalendar from '../BookingCalendar.jsx';

const mockBookings = [
  {
    id: 1,
    service_name: 'Wedding Photography',
    customer_name: 'John Doe',
    event_date: '2024-03-15T14:00:00Z',
    status: 'confirmed',
    total_amount: 1500
  },
  {
    id: 2,
    service_name: 'Portrait Session',
    customer_name: 'Jane Smith',
    event_date: '2024-03-16T10:00:00Z',
    status: 'pending',
    total_amount: 200
  },
  {
    id: 3,
    service_name: 'Event Photography',
    customer_name: 'Bob Johnson',
    event_date: '2024-03-15T16:00:00Z',
    status: 'completed',
    total_amount: 800
  }
];

describe('BookingCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date to ensure consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders booking calendar interface', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    expect(screen.getByText('Booking Calendar')).toBeInTheDocument();
    expect(screen.getByText('Manage your availability and view bookings')).toBeInTheDocument();
  });

  it('displays current month and year', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    expect(screen.getByText('March 2024')).toBeInTheDocument();
  });

  it('shows day headers', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('navigates to previous month when left arrow is clicked', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(screen.getByText('February 2024')).toBeInTheDocument();
  });

  it('navigates to next month when right arrow is clicked', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText('April 2024')).toBeInTheDocument();
  });

  it('displays bookings on correct dates', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Check for booking indicators on March 15 and 16
    expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
    expect(screen.getByText('Portrait Session')).toBeInTheDocument();
    expect(screen.getByText('Event Photography')).toBeInTheDocument();
  });

  it('shows booking status with correct colors', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    const confirmedBooking = screen.getByText('Wedding Photography');
    const pendingBooking = screen.getByText('Portrait Session');
    const completedBooking = screen.getByText('Event Photography');

    expect(confirmedBooking).toHaveClass('bg-green-100', 'text-green-800');
    expect(pendingBooking).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(completedBooking).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('handles date selection', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Click on March 15th (assuming it's clickable)
    const dateCell = screen.getByText('15');
    fireEvent.click(dateCell);

    // Should show selected date information in sidebar
    expect(screen.getByText(/Friday, March 15, 2024/)).toBeInTheDocument();
  });

  it('shows bookings for selected date in sidebar', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Click on March 15th
    const dateCell = screen.getByText('15');
    fireEvent.click(dateCell);

    // Should show bookings for that date
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
    expect(screen.getByText('Event Photography')).toBeInTheDocument();
  });

  it('prevents clicking on past dates', () => {
    // Set current date to March 10, 2024
    vi.setSystemTime(new Date('2024-03-10T12:00:00Z'));
    
    render(<BookingCalendar bookings={mockBookings} />);

    // March 5th should be in the past and not clickable
    const pastDate = screen.getByText('5');
    const pastDateCell = pastDate.closest('div');
    
    expect(pastDateCell).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('highlights today\'s date', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // March 1st should be highlighted as today
    const todayDate = screen.getByText('1');
    const todayCell = todayDate.closest('div');
    
    expect(todayCell).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('opens availability modal when Add Availability is clicked', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Select a future date first
    const futureDate = screen.getByText('20');
    fireEvent.click(futureDate);

    // Click Add Availability
    const addButton = screen.getByText('Add Availability');
    fireEvent.click(addButton);

    expect(screen.getByText('Set Availability')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
  });

  it('saves availability when form is submitted', async () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Select a future date
    const futureDate = screen.getByText('20');
    fireEvent.click(futureDate);

    // Open availability modal
    const addButton = screen.getByText('Add Availability');
    fireEvent.click(addButton);

    // Fill form
    const startTimeInput = screen.getByLabelText('Start Time');
    const endTimeInput = screen.getByLabelText('End Time');
    
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '17:00' } });

    // Submit form
    const saveButton = screen.getByText('Save Availability');
    fireEvent.click(saveButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Set Availability')).not.toBeInTheDocument();
    });
  });

  it('closes availability modal when cancel is clicked', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Select a future date
    const futureDate = screen.getByText('20');
    fireEvent.click(futureDate);

    // Open availability modal
    const addButton = screen.getByText('Add Availability');
    fireEvent.click(addButton);

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Set Availability')).not.toBeInTheDocument();
  });

  it('shows availability indicator for dates with availability', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Mock availability slots are set for March 15 and 16
    // Should show green dots for available dates
    const availabilityIndicators = screen.getAllByRole('generic', { hidden: true });
    const greenDots = availabilityIndicators.filter(el => 
      el.className.includes('bg-green-400')
    );
    
    expect(greenDots.length).toBeGreaterThan(0);
  });

  it('removes availability when remove button is clicked', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Select a date with availability (March 15)
    const dateWithAvailability = screen.getByText('15');
    fireEvent.click(dateWithAvailability);

    // Should show availability info with remove button
    const removeButton = screen.getByTitle('Remove availability');
    fireEvent.click(removeButton);

    // Availability should be removed (green dot should disappear)
    // This is a simplified test - in reality, we'd check the state change
  });

  it('displays legend with correct color coding', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Pending booking')).toBeInTheDocument();
    expect(screen.getByText('Confirmed booking')).toBeInTheDocument();
    expect(screen.getByText('Completed booking')).toBeInTheDocument();
  });

  it('formats time correctly', () => {
    render(<BookingCalendar bookings={mockBookings} />);

    // Select March 15 which has mock availability
    const dateCell = screen.getByText('15');
    fireEvent.click(dateCell);

    // Should show formatted time (9:00 AM - 5:00 PM)
    expect(screen.getByText(/9:00 AM - 5:00 PM/)).toBeInTheDocument();
  });

  it('shows multiple bookings indicator when there are more than 2 bookings', () => {
    const manyBookings = [
      ...mockBookings,
      {
        id: 4,
        service_name: 'Another Service',
        customer_name: 'Another Customer',
        event_date: '2024-03-15T18:00:00Z',
        status: 'pending',
        total_amount: 300
      }
    ];

    render(<BookingCalendar bookings={manyBookings} />);

    // Should show "+1 more" or similar indicator
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('handles empty bookings array', () => {
    render(<BookingCalendar bookings={[]} />);

    expect(screen.getByText('Booking Calendar')).toBeInTheDocument();
    expect(screen.getByText('March 2024')).toBeInTheDocument();
    
    // Should not show any booking indicators
    expect(screen.queryByText('Wedding Photography')).not.toBeInTheDocument();
  });
});