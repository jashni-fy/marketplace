import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext.jsx';
import { AppProvider } from '../../contexts/AppContext.jsx';
import MarketplaceHome from '../MarketplaceHome.jsx';
import { apiService } from '../../services/api.jsx';

// Mock the API service
vi.mock('../../services/api.jsx', () => ({
  apiService: {
    services: {
      getAll: vi.fn()
    }
  }
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
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

describe('MarketplaceHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.services.getAll.mockResolvedValue({
      data: {
        services: [
          {
            id: 1,
            name: 'Wedding Photography',
            description: 'Professional wedding photography services',
            base_price: 1500,
            pricing_type: 'package',
            vendor_profile_id: 1,
            rating: 4.8,
            reviews_count: 25,
            images: [{ url: 'https://example.com/image1.jpg' }]
          },
          {
            id: 2,
            name: 'Event Videography',
            description: 'High-quality event videography',
            base_price: 200,
            pricing_type: 'hourly',
            vendor_profile_id: 2,
            rating: 4.9,
            reviews_count: 15,
            images: [{ url: 'https://example.com/image2.jpg' }]
          }
        ]
      }
    });
  });

  it('renders the hero section with search functionality', () => {
    renderWithProviders(<MarketplaceHome />);
    
    expect(screen.getByText('Find Perfect Service Providers')).toBeInTheDocument();
    expect(screen.getByText('Connect with professional photographers, videographers, event managers, and more')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for services, vendors, or locations...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('displays service categories', () => {
    renderWithProviders(<MarketplaceHome />);
    
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
    expect(screen.getByText('Videography')).toBeInTheDocument();
    expect(screen.getByText('Event Management')).toBeInTheDocument();
    expect(screen.getByText('Wedding Planning')).toBeInTheDocument();
    expect(screen.getByText('Catering')).toBeInTheDocument();
    expect(screen.getByText('DJ Services')).toBeInTheDocument();
  });

  it('handles search form submission', async () => {
    renderWithProviders(<MarketplaceHome />);
    
    const searchInput = screen.getByPlaceholderText('Search for services, vendors, or locations...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    fireEvent.change(searchInput, { target: { value: 'photography' } });
    fireEvent.click(searchButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/services?search=photography');
  });

  it('handles category click navigation', () => {
    renderWithProviders(<MarketplaceHome />);
    
    const photographyCategory = screen.getByText('Photography').closest('div');
    fireEvent.click(photographyCategory);
    
    expect(mockNavigate).toHaveBeenCalledWith('/services?category=photography');
  });

  it('loads and displays featured services', async () => {
    renderWithProviders(<MarketplaceHome />);
    
    await waitFor(() => {
      expect(apiService.services.getAll).toHaveBeenCalledWith({
        featured: true,
        limit: 6,
        status: 'active'
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Featured Services')).toBeInTheDocument();
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      expect(screen.getByText('Event Videography')).toBeInTheDocument();
      expect(screen.getByText('$1500')).toBeInTheDocument();
      expect(screen.getByText('$200/hr')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully for featured services', async () => {
    apiService.services.getAll.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<MarketplaceHome />);
    
    await waitFor(() => {
      expect(apiService.services.getAll).toHaveBeenCalled();
    });

    // Should not display featured services section when API fails
    expect(screen.queryByText('Featured Services')).not.toBeInTheDocument();
  });

  it('displays call to action section', () => {
    renderWithProviders(<MarketplaceHome />);
    
    expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
    expect(screen.getByText('Join thousands of satisfied customers who found their perfect service providers')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse All Services' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Become a Vendor' })).toBeInTheDocument();
  });

  it('prevents search with empty query', () => {
    renderWithProviders(<MarketplaceHome />);
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('trims search query before navigation', () => {
    renderWithProviders(<MarketplaceHome />);
    
    const searchInput = screen.getByPlaceholderText('Search for services, vendors, or locations...');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    
    fireEvent.change(searchInput, { target: { value: '  photography  ' } });
    fireEvent.click(searchButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/services?search=photography');
  });

  it('displays service ratings and reviews count', async () => {
    renderWithProviders(<MarketplaceHome />);
    
    await waitFor(() => {
      expect(screen.getByText('4.8 (25 reviews)')).toBeInTheDocument();
      expect(screen.getByText('4.9 (15 reviews)')).toBeInTheDocument();
    });
  });

  it('links to vendor profiles from featured services', async () => {
    renderWithProviders(<MarketplaceHome />);
    
    await waitFor(() => {
      const viewDetailsLinks = screen.getAllByText('View Details');
      expect(viewDetailsLinks).toHaveLength(2);
      expect(viewDetailsLinks[0].closest('a')).toHaveAttribute('href', '/vendors/1');
      expect(viewDetailsLinks[1].closest('a')).toHaveAttribute('href', '/vendors/2');
    });
  });
});