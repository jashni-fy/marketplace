import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorProfile from '../pages/VendorProfile';
import { apiService } from '../../lib/api';

// Mock the API service
jest.mock('../../lib/api', () => ({
  apiService: {
    vendors: {
      getById: jest.fn(),
      getServices: jest.fn(),
      getPortfolio: jest.fn(),
      getReviews: jest.fn(),
    },
  },
}));

const mockVendor = {
  id: '1',
  business_name: 'Test Photography Studio',
  description: 'Professional photography services for all occasions',
  location: 'New York, NY',
  phone: '+1-555-123-4567',
  website: 'https://testphoto.com',
  service_categories: ['Photography', 'Videography'],
  business_license: 'BL123456',
  years_experience: 10,
  average_rating: '4.5',
  total_reviews: 25,
  is_verified: true,
  profile_complete: true,
  services_count: 3,
  portfolio_items_count: 12,
  featured_portfolio: [
    {
      id: '1',
      title: 'Wedding Photography',
      description: 'Beautiful wedding photos',
      category: 'photography',
      is_featured: true,
      image_count: 5,
      images: [],
      primary_image_url: 'https://example.com/image1.jpg',
    },
  ],
  portfolio_categories: ['photography', 'videography'],
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060,
  },
  user: {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@testphoto.com',
  },
};

const mockServices = [
  {
    id: '1',
    name: 'Wedding Photography',
    description: 'Complete wedding photography package',
    base_price: 1500,
    formatted_price: '$1,500',
    pricing_type: 'package',
    category: {
      id: '1',
      name: 'Photography',
      slug: 'photography',
    },
    has_images: true,
    primary_image_url: 'https://example.com/service1.jpg',
  },
];

const mockPortfolio = [
  {
    id: '1',
    title: 'Wedding Portfolio',
    description: 'Collection of wedding photos',
    category: 'photography',
    is_featured: true,
    image_count: 10,
    images: [],
    primary_image_url: 'https://example.com/portfolio1.jpg',
  },
];

const mockReviews = [];

describe('VendorProfile', () => {
  const mockParams = { id: '1' };

  beforeEach(() => {
    apiService.vendors.getById.mockResolvedValue({ data: { vendor: mockVendor } });
    apiService.vendors.getServices.mockResolvedValue({ data: { services: mockServices } });
    apiService.vendors.getPortfolio.mockResolvedValue({ data: { portfolio_items: mockPortfolio } });
    apiService.vendors.getReviews.mockResolvedValue({ data: { reviews: mockReviews } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<VendorProfile params={mockParams} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders vendor profile information', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Photography Studio')).toBeInTheDocument();
    });

    expect(screen.getByText('Professional photography services for all occasions')).toBeInTheDocument();
    expect(screen.getByText('📍 New York, NY')).toBeInTheDocument();
    expect(screen.getByText('📞 +1-555-123-4567')).toBeInTheDocument();
    expect(screen.getByText('✓ Verified')).toBeInTheDocument();
    expect(screen.getByText('10 years experience')).toBeInTheDocument();
    expect(screen.getByText('4.5 (25 reviews)')).toBeInTheDocument();
  });

  it('renders service categories as badges', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getAllByText('Photography')).toHaveLength(2); // One in categories, one in service
    });

    expect(screen.getByText('Videography')).toBeInTheDocument();
  });

  it('renders featured portfolio section', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Featured Work')).toBeInTheDocument();
    });

    expect(screen.getAllByAltText('Wedding Photography')).toHaveLength(2); // One in featured, one in services
  });

  it('switches between tabs correctly', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Services (1)')).toBeInTheDocument();
    });

    // Initially shows services tab
    expect(screen.getByText('Wedding Photography')).toBeInTheDocument();

    // Switch to portfolio tab
    fireEvent.click(screen.getByText('Portfolio (1)'));
    expect(screen.getByText('Wedding Portfolio')).toBeInTheDocument();

    // Switch to reviews tab
    fireEvent.click(screen.getByText('Reviews (25)'));
    expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
  });

  it('renders services with correct information', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
    });

    expect(screen.getByText('Complete wedding photography package')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();
    expect(screen.getAllByText('Photography')).toHaveLength(2); // One in categories, one in service
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    apiService.vendors.getById.mockRejectedValue(new Error('API Error'));

    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Vendor Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load vendor profile')).toBeInTheDocument();
  });

  it('renders star ratings correctly', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(4); // 4 full stars for 4.5 rating
    });
  });

  it('calls API endpoints with correct parameters', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(apiService.vendors.getById).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getServices).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getPortfolio).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getReviews).toHaveBeenCalledWith('1');
    });
  });
});