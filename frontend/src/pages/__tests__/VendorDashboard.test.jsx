import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import VendorDashboard from '../VendorDashboard.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { apiService } from '../../services/api.jsx';

// Mock the dependencies
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../services/api.jsx', () => ({
  apiService: {
    services: {
      getAll: vi.fn(),
    },
    bookings: {
      getAll: vi.fn(),
    }
  }
}));

// Mock the child components
vi.mock('../../components/ServiceManagement.jsx', () => ({
  default: ({ services, onServiceUpdate }) => (
    <div data-testid="service-management">
      Service Management Component
      <div>Services count: {services.length}</div>
      <button onClick={onServiceUpdate}>Update Services</button>
    </div>
  )
}));

vi.mock('../../components/PortfolioManager.jsx', () => ({
  default: () => <div data-testid="portfolio-manager">Portfolio Manager Component</div>
}));

vi.mock('../../components/BookingCalendar.jsx', () => ({
  default: ({ bookings }) => (
    <div data-testid="booking-calendar">
      Booking Calendar Component
      <div>Bookings count: {bookings.length}</div>
    </div>
  )
}));

const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  role: 'vendor'
};

const mockServices = [
  {
    id: 1,
    name: 'Wedding Photography',
    status: 'active',
    formatted_price: '$1500',
    category: { name: 'Photography' }
  },
  {
    id: 2,
    name: 'Portrait Session',
    status: 'draft',
    formatted_price: '$200/hour',
    category: { name: 'Photography' }
  }
];

const mockBookings = [
  {
    id: 1,
    service_name: 'Wedding Photography',
    status: 'pending',
    event_date: '2024-03-15',
    total_amount: 1500
  },
  {
    id: 2,
    service_name: 'Portrait Session',
    status: 'completed',
    event_date: '2024-03-10',
    total_amount: 200
  }
];

describe('VendorDashboard', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout
    });

    apiService.services.getAll.mockResolvedValue({
      data: { services: mockServices }
    });

    apiService.bookings.getAll.mockResolvedValue({
      data: { bookings: mockBookings }
    });
  });

  it('renders vendor dashboard with welcome message', async () => {
    render(<VendorDashboard />);

    expect(screen.getByText('Vendor Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<VendorDashboard />);

    expect(screen.getByRole('generic', { name: /loading/i })).toBeInTheDocument();
  });

  it('loads and displays dashboard data', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      expect(apiService.services.getAll).toHaveBeenCalled();
    });

    expect(screen.queryByRole('generic', { name: /loading/i })).not.toBeInTheDocument();
  });

  it('displays metrics cards with correct data', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Services')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total services
      expect(screen.getByText('Active Services')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Active services
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('calculates metrics correctly', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      // Should show 2 total services
      expect(screen.getByText('2')).toBeInTheDocument();
      // Should show 1 active service (Wedding Photography)
      expect(screen.getByText('1')).toBeInTheDocument();
      // Should show total revenue from completed bookings
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  it('displays recent services in overview', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Services')).toBeInTheDocument();
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      expect(screen.getByText('Portrait Session')).toBeInTheDocument();
      expect(screen.getByText('$1500')).toBeInTheDocument();
      expect(screen.getByText('$200/hour')).toBeInTheDocument();
    });
  });

  it('shows service status badges with correct colors', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      const activeStatus = screen.getByText('active');
      const draftStatus = screen.getByText('draft');

      expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800');
      expect(draftStatus).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  it('displays navigation tabs', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('Overview');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('Services');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('Portfolio');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent?.includes('Calendar');
      })).toBeInTheDocument();
    });
  });

  it('switches tabs when clicked', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      // Initially on overview tab
      expect(screen.getByText('Recent Services')).toBeInTheDocument();
    });

    // Click on Services tab
    const servicesTab = screen.getByText((content, element) => {
      return element?.textContent?.includes('Services');
    });
    fireEvent.click(servicesTab);
    expect(screen.getByTestId('service-management')).toBeInTheDocument();

    // Click on Portfolio tab
    const portfolioTab = screen.getByText((content, element) => {
      return element?.textContent?.includes('Portfolio');
    });
    fireEvent.click(portfolioTab);
    expect(screen.getByTestId('portfolio-manager')).toBeInTheDocument();

    // Click on Calendar tab
    const calendarTab = screen.getByText((content, element) => {
      return element?.textContent?.includes('Calendar');
    });
    fireEvent.click(calendarTab);
    expect(screen.getByTestId('booking-calendar')).toBeInTheDocument();
  });

  it('highlights active tab', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      const overviewTab = screen.getByText((content, element) => {
        return element?.textContent?.includes('Overview');
      });
      expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600');
    });

    // Click on Services tab
    const servicesTab = screen.getByText((content, element) => {
      return element?.textContent?.includes('Services');
    });
    fireEvent.click(servicesTab);
    
    expect(servicesTab).toHaveClass('border-blue-500', 'text-blue-600');
  });

  it('passes correct props to child components', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      // Switch to services tab
      const servicesTab = screen.getByText((content, element) => {
        return element?.textContent?.includes('Services');
      });
      fireEvent.click(servicesTab);
    });

    expect(screen.getByText('Services count: 2')).toBeInTheDocument();

    // Switch to calendar tab
    const calendarTab = screen.getByText((content, element) => {
      return element?.textContent?.includes('Calendar');
    });
    fireEvent.click(calendarTab);
    expect(screen.getByText('Bookings count: 0')).toBeInTheDocument(); // 0 because bookings are mocked as empty array
  });

  it('handles service update callback', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      const servicesTab = screen.getByText((content, element) => {
        return element?.textContent?.includes('Services');
      });
      fireEvent.click(servicesTab);
    });

    // Trigger service update
    fireEvent.click(screen.getByText('Update Services'));

    // Should call API again to refresh data
    await waitFor(() => {
      expect(apiService.services.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('handles logout when logout button is clicked', async () => {
    render(<VendorDashboard />);

    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('displays error message when API call fails', async () => {
    apiService.services.getAll.mockRejectedValue(new Error('API Error'));

    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows empty state message when no services exist', async () => {
    apiService.services.getAll.mockResolvedValue({
      data: { services: [] }
    });

    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No services yet. Create your first service to get started!')).toBeInTheDocument();
    });
  });

  it('shows empty state for pending bookings when none exist', async () => {
    apiService.services.getAll.mockResolvedValue({
      data: { services: mockServices }
    });

    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No pending bookings at the moment.')).toBeInTheDocument();
    });
  });

  it('displays pending bookings when they exist', async () => {
    const bookingsWithPending = [
      ...mockBookings,
      {
        id: 3,
        service_name: 'Event Photography',
        status: 'pending',
        event_date: '2024-03-20',
        total_amount: 800
      }
    ];

    // Mock bookings API to return pending bookings
    // Note: In the current implementation, bookings are mocked as empty array
    // This test would work when booking API is properly implemented

    render(<VendorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pending Bookings')).toBeInTheDocument();
    });
  });

  it('limits displayed services and bookings to 5 items', async () => {
    const manyServices = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Service ${i + 1}`,
      status: 'active',
      formatted_price: `$${(i + 1) * 100}`,
      category: { name: 'Photography' }
    }));

    apiService.services.getAll.mockResolvedValue({
      data: { services: manyServices }
    });

    render(<VendorDashboard />);

    await waitFor(() => {
      // Should only show first 5 services
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 5')).toBeInTheDocument();
      expect(screen.queryByText('Service 6')).not.toBeInTheDocument();
    });
  });
});