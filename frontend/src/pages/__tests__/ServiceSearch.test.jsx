import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext.jsx';
import { AppProvider } from '../../contexts/AppContext.jsx';
import ServiceSearch from '../ServiceSearch.jsx';
import { apiService } from '../../services/api.jsx';

// Mock the API service
vi.mock('../../services/api.jsx', () => ({
  apiService: {
    services: {
      search: vi.fn()
    }
  }
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockSearchParams = {
  get: vi.fn().mockReturnValue(''),
  set: vi.fn(),
  clear: vi.fn()
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams]
  };
});

// Mock the useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children
}));

const renderWithProviders = (component) => {
  mockUseAuth.mockReturnValue({
    user: null,
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

const mockServices = [
  {
    id: 1,
    name: 'Wedding Photography',
    description: 'Professional wedding photography services with 10+ years experience',
    base_price: 1500,
    pricing_type: 'package',
    vendor_profile_id: 1,
    rating: 4.8,
    reviews_count: 25,
    category_name: 'Photography',
    location: 'New York, NY',
    images: [{ url: 'https://example.com/image1.jpg' }]
  },
  {
    id: 2,
    name: 'Event Videography',
    description: 'High-quality event videography for all occasions',
    base_price: 200,
    pricing_type: 'hourly',
    vendor_profile_id: 2,
    rating: 4.9,
    reviews_count: 15,
    category_name: 'Videography',
    location: 'Los Angeles, CA',
    images: [{ url: 'https://example.com/image2.jpg' }]
  }
];

describe('ServiceSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.get.mockReturnValue('');
    apiService.services.search.mockResolvedValue({
      data: {
        services: mockServices,
        total_count: 2
      }
    });
  });

  it('renders the search interface', () => {
    renderWithProviders(<ServiceSearch />);
    
    expect(screen.getByText('Find Services')).toBeInTheDocument();
    expect(screen.getByText('Discover professional service providers for your events and special occasions')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search services, vendors, or keywords...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('displays filter options when filters are shown', () => {
    renderWithProviders(<ServiceSearch />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Price Range')).toBeInTheDocument();
    expect(screen.getByLabelText('Pricing Type')).toBeInTheDocument();
  });

  it('loads and displays services', async () => {
    renderWithProviders(<ServiceSearch />);
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith({
        search: '',
        category: '',
        location: '',
        minPrice: '',
        maxPrice: '',
        pricingType: '',
        sortBy: 'relevance',
        page: 1,
        per_page: 12,
        status: 'active'
      });
    });

    await waitFor(() => {
      expect(screen.getByText('2 services found')).toBeInTheDocument();
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      expect(screen.getByText('Event Videography')).toBeInTheDocument();
    });
  });

  it('handles search form submission', async () => {
    renderWithProviders(<ServiceSearch />);
    
    const searchInput = screen.getByPlaceholderText('Search services, vendors, or keywords...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    fireEvent.change(searchInput, { target: { value: 'photography' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'photography'
        })
      );
    });
  });

  it('handles category filter change', async () => {
    renderWithProviders(<ServiceSearch />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'photography' } });
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'photography'
        })
      );
    });
  });

  it('handles location filter change', async () => {
    renderWithProviders(<ServiceSearch />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const locationInput = screen.getByPlaceholderText('City, State');
    fireEvent.change(locationInput, { target: { value: 'New York' } });
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith(
        expect.objectContaining({
          location: 'New York'
        })
      );
    });
  });

  it('handles price range filter changes', async () => {
    renderWithProviders(<ServiceSearch />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const minPriceInput = screen.getByPlaceholderText('Min');
    const maxPriceInput = screen.getByPlaceholderText('Max');
    
    fireEvent.change(minPriceInput, { target: { value: '100' } });
    fireEvent.change(maxPriceInput, { target: { value: '1000' } });
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith(
        expect.objectContaining({
          minPrice: '1000',
          maxPrice: '1000'
        })
      );
    });
  });

  it('handles sort option change', async () => {
    renderWithProviders(<ServiceSearch />);
    
    const sortSelect = screen.getByDisplayValue('Most Relevant');
    fireEvent.change(sortSelect, { target: { value: 'price_low' } });
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'price_low'
        })
      );
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    renderWithProviders(<ServiceSearch />);
    
    // Set some filters first
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'photography' } });
    
    // Clear filters
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(apiService.services.search).toHaveBeenCalledWith(
        expect.objectContaining({
          category: '',
          search: '',
          location: '',
          minPrice: '',
          maxPrice: '',
          pricingType: '',
          sortBy: 'relevance'
        })
      );
    });
  });

  it('displays service information correctly', async () => {
    renderWithProviders(<ServiceSearch />);
    
    await waitFor(() => {
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      expect(screen.getByText('$1500')).toBeInTheDocument();
      expect(screen.getByText('$200/hr')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Videography')).toBeInTheDocument();
      expect(screen.getByText('📍 New York, NY')).toBeInTheDocument();
      expect(screen.getByText('📍 Los Angeles, CA')).toBeInTheDocument();
      expect(screen.getByText('4.8 (25 reviews)')).toBeInTheDocument();
      expect(screen.getByText('4.9 (15 reviews)')).toBeInTheDocument();
    });
  });

  it('displays no results message when no services found', async () => {
    apiService.services.search.mockResolvedValue({
      data: {
        services: [],
        total_count: 0
      }
    });
    
    renderWithProviders(<ServiceSearch />);
    
    await waitFor(() => {
      expect(screen.getByText('No services found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria or browse all categories')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    apiService.services.search.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<ServiceSearch />);
    
    await waitFor(() => {
      expect(screen.getByText('No services found')).toBeInTheDocument();
    });
  });

  it('displays pagination when there are multiple pages', async () => {
    apiService.services.search.mockResolvedValue({
      data: {
        services: mockServices,
        total_count: 25 // More than 12 per page
      }
    });
    
    renderWithProviders(<ServiceSearch />);
    
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });
  });

  it('links to vendor profiles from service cards', async () => {
    renderWithProviders(<ServiceSearch />);
    
    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons).toHaveLength(2);
      expect(viewDetailsButtons[0].closest('a')).toHaveAttribute('href', '/vendors/1');
      expect(viewDetailsButtons[1].closest('a')).toHaveAttribute('href', '/vendors/2');
    });
  });

  it('updates URL parameters when filters change', async () => {
    renderWithProviders(<ServiceSearch />);
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'photography' } });
    
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled();
    });
  });

  it('initializes filters from URL parameters', () => {
    mockSearchParams.get.mockImplementation((key) => {
      const params = { search: 'wedding', category: 'photography', location: 'New York' };
      return params[key] || '';
    });
    
    renderWithProviders(<ServiceSearch />);
    
    expect(screen.getByDisplayValue('wedding')).toBeInTheDocument();
  });
});