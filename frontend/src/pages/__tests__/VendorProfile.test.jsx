import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext.jsx';
import { AppProvider } from '../../contexts/AppContext.jsx';
import VendorProfile from '../VendorProfile.jsx';
import { apiService } from '../../services/api.jsx';

// Mock the API service
vi.mock('../../services/api.jsx', () => ({
  apiService: {
    vendors: {
      getById: vi.fn(),
      getServices: vi.fn()
    }
  }
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockParams = { id: '1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams
  };
});

const mockVendor = {
  id: 1,
  business_name: 'Amazing Photography Studio',
  description: 'Professional photography services with over 10 years of experience in wedding and event photography.',
  location: 'New York, NY',
  average_rating: 4.8,
  reviews_count: 25,
  avatar: 'https://example.com/avatar.jpg',
  cover_image: 'https://example.com/cover.jpg',
  specialties: ['Wedding Photography', 'Portrait Photography', 'Event Photography'],
  years_experience: 10,
  certifications: ['Professional Photographers of America', 'Wedding Photography Certification'],
  phone: '+1 (555) 123-4567',
  website: 'https://amazingphotography.com',
  portfolio_items: [
    { image_url: 'https://example.com/portfolio1.jpg', title: 'Wedding Portfolio' },
    { image_url: 'https://example.com/portfolio2.jpg', title: 'Event Portfolio' }
  ],
  reviews: [
    {
      id: 1,
      customer_name: 'John Doe',
      rating: 5,
      comment: 'Excellent service! Highly recommended.',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      customer_name: 'Jane Smith',
      rating: 4,
      comment: 'Great photographer, very professional.',
      created_at: '2024-01-10T14:20:00Z'
    }
  ]
};

const mockServices = [
  {
    id: 1,
    name: 'Wedding Photography Package',
    description: 'Complete wedding photography package including engagement session',
    base_price: 2500,
    pricing_type: 'package',
    category_name: 'Photography',
    images: [{ url: 'https://example.com/service1.jpg' }]
  },
  {
    id: 2,
    name: 'Portrait Session',
    description: 'Professional portrait photography session',
    base_price: 300,
    pricing_type: 'hourly',
    category_name: 'Photography',
    images: [{ url: 'https://example.com/service2.jpg' }]
  }
];

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children
}));

const renderWithProviders = (component, authUser = null) => {
  mockUseAuth.mockReturnValue({
    user: authUser,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    error: null
  });

  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('VendorProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.vendors.getById.mockResolvedValue({ data: mockVendor });
    apiService.vendors.getServices.mockResolvedValue({ data: { services: mockServices } });
  });

  it('renders loading state initially', () => {
    apiService.vendors.getById.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithProviders(<VendorProfile />);
    
    expect(screen.getByText('Loading vendor profile...')).toBeInTheDocument();
  });

  it('loads and displays vendor information', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(apiService.vendors.getById).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getServices).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(screen.getByText('Amazing Photography Studio')).toBeInTheDocument();
      expect(screen.getByText('Professional photography services with over 10 years of experience in wedding and event photography.')).toBeInTheDocument();
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText(/25 reviews/)).toBeInTheDocument();
    });
  });

  it('displays vendor specialties', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      expect(screen.getByText('Portrait Photography')).toBeInTheDocument();
      expect(screen.getByText('Event Photography')).toBeInTheDocument();
    });
  });

  it('displays services in the services tab', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Services (2)')).toBeInTheDocument();
      expect(screen.getByText('Wedding Photography Package')).toBeInTheDocument();
      expect(screen.getByText('Portrait Session')).toBeInTheDocument();
      expect(screen.getByText('$2500')).toBeInTheDocument();
      expect(screen.getByText('$300/hr')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Wedding Photography Package')).toBeInTheDocument();
    });

    // Switch to portfolio tab
    const portfolioTab = screen.getByText('Portfolio');
    fireEvent.click(portfolioTab);
    
    expect(screen.getByAltText('Wedding Portfolio')).toBeInTheDocument();
    expect(screen.getByAltText('Event Portfolio')).toBeInTheDocument();

    // Switch to reviews tab
    const reviewsTab = screen.getByText(/Reviews \(25\)/);
    fireEvent.click(reviewsTab);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Excellent service! Highly recommended.')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Great photographer, very professional.')).toBeInTheDocument();

    // Switch to about tab
    const aboutTab = screen.getByText('About');
    fireEvent.click(aboutTab);
    
    expect(screen.getByText('About Amazing Photography Studio')).toBeInTheDocument();
    expect(screen.getByText('10 years in the industry')).toBeInTheDocument();
    expect(screen.getByText('Professional Photographers of America')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
  });

  it('handles book service for authenticated customer', async () => {
    const customerUser = { id: 1, role: 'customer', email: 'customer@example.com' };
    renderWithProviders(<VendorProfile />, customerUser);
    
    await waitFor(() => {
      expect(screen.getByText('Wedding Photography Package')).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText('Book Now');
    fireEvent.click(bookButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/booking/1');
  });

  it('redirects to login for unauthenticated users trying to book', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Wedding Photography Package')).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText('Book Now');
    fireEvent.click(bookButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows warning for vendors trying to book services', async () => {
    const vendorUser = { id: 2, role: 'vendor', email: 'vendor@example.com' };
    renderWithProviders(<VendorProfile />, vendorUser);
    
    await waitFor(() => {
      expect(screen.getByText('Wedding Photography Package')).toBeInTheDocument();
    });

    const bookButtons = screen.getAllByText('Book Now');
    fireEvent.click(bookButtons[0]);
    
    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining('/booking/'));
  });

  it('handles contact vendor button click', async () => {
    const customerUser = { id: 1, role: 'customer', email: 'customer@example.com' };
    renderWithProviders(<VendorProfile />, customerUser);
    
    await waitFor(() => {
      expect(screen.getByText('Amazing Photography Studio')).toBeInTheDocument();
    });

    const contactButton = screen.getByText('Contact Vendor');
    fireEvent.click(contactButton);
    
    // Should show notification about contact feature coming soon
    // This would be tested through the notification system
  });

  it('displays empty states for missing content', async () => {
    const vendorWithoutContent = {
      ...mockVendor,
      portfolio_items: [],
      reviews: [],
      reviews_count: 0
    };
    
    apiService.vendors.getById.mockResolvedValue({ data: vendorWithoutContent });
    apiService.vendors.getServices.mockResolvedValue({ data: { services: [] } });
    
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Amazing Photography Studio')).toBeInTheDocument();
    });

    // Check services empty state
    expect(screen.getByText('No services available')).toBeInTheDocument();

    // Check portfolio empty state
    const portfolioTab = screen.getByText('Portfolio');
    fireEvent.click(portfolioTab);
    expect(screen.getByText('No portfolio items')).toBeInTheDocument();

    // Check reviews empty state
    const reviewsTab = screen.getByText(/Reviews \(0\)/);
    fireEvent.click(reviewsTab);
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    apiService.vendors.getById.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(apiService.vendors.getById).toHaveBeenCalled();
    });

    // Should continue to show loading state or handle error appropriately
    expect(screen.getByText('Loading vendor profile...')).toBeInTheDocument();
  });

  it('displays vendor avatar or fallback', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      const avatar = screen.getByAltText('Amazing Photography Studio');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('displays vendor avatar fallback when no image', async () => {
    const vendorWithoutAvatar = { ...mockVendor, avatar: null };
    apiService.vendors.getById.mockResolvedValue({ data: vendorWithoutAvatar });
    
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument(); // First letter fallback
    });
  });

  it('displays star ratings correctly in reviews', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Amazing Photography Studio')).toBeInTheDocument();
    });

    const reviewsTab = screen.getByText('Reviews (25)');
    fireEvent.click(reviewsTab);
    
    // Should display star ratings for each review
    const starElements = screen.getAllByText('★');
    expect(starElements.length).toBeGreaterThan(0);
  });

  it('formats review dates correctly', async () => {
    renderWithProviders(<VendorProfile />);
    
    await waitFor(() => {
      expect(screen.getByText('Amazing Photography Studio')).toBeInTheDocument();
    });

    const reviewsTab = screen.getByText('Reviews (25)');
    fireEvent.click(reviewsTab);
    
    // Should display formatted dates
    expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    expect(screen.getByText('1/10/2024')).toBeInTheDocument();
  });
});