import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PortfolioManager from '../PortfolioManager.jsx';
import { apiService } from '../../services/api.jsx';

// Mock the API service
vi.mock('../../services/api.jsx', () => ({
  apiService: {
    services: {
      getAll: vi.fn(),
    }
  }
}));

const mockServices = [
  {
    id: 1,
    name: 'Wedding Photography',
    description: 'Professional wedding photography services',
    service_images: [
      {
        id: 1,
        title: 'Wedding Photo 1',
        description: 'Beautiful wedding ceremony',
        medium_url: 'https://example.com/wedding1.jpg',
        thumbnail_url: 'https://example.com/wedding1_thumb.jpg',
        is_primary: true
      },
      {
        id: 2,
        title: 'Wedding Photo 2',
        description: 'Reception moments',
        medium_url: 'https://example.com/wedding2.jpg',
        thumbnail_url: 'https://example.com/wedding2_thumb.jpg',
        is_primary: false
      }
    ],
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Portrait Session',
    description: 'Individual and family portrait sessions',
    service_images: [
      {
        id: 3,
        title: 'Family Portrait',
        description: 'Happy family photo',
        medium_url: 'https://example.com/family1.jpg',
        thumbnail_url: 'https://example.com/family1_thumb.jpg',
        is_primary: true
      }
    ],
    created_at: '2024-01-10T10:00:00Z'
  }
];

describe('PortfolioManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.services.getAll.mockResolvedValue({
      data: { services: mockServices }
    });
  });

  it('renders portfolio manager interface', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Manager')).toBeInTheDocument();
    });

    expect(screen.getByText('Showcase your work and attract more customers')).toBeInTheDocument();
    expect(screen.getByText('Upload New Images')).toBeInTheDocument();
  });

  it('loads and displays portfolio items grouped by service', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
      expect(screen.getByText('Portrait Session')).toBeInTheDocument();
    });

    expect(screen.getByText('(2 images)')).toBeInTheDocument();
    expect(screen.getByText('(1 image)')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<PortfolioManager />);

    expect(screen.getByRole('generic', { name: /loading/i })).toBeInTheDocument();
  });

  it('displays service selection dropdown', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('Select Service *')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Choose a service...')).toBeInTheDocument();
  });

  it('shows upload area with drag and drop functionality', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('Drop images here or click to browse')).toBeInTheDocument();
    });

    expect(screen.getByText('Supports JPG, PNG, GIF up to 10MB each')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
  });

  it('enables file upload button only when service is selected', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      const chooseFilesButton = screen.getByText('Choose Files');
      expect(chooseFilesButton).toHaveClass('bg-gray-400', 'cursor-not-allowed');
    });

    // Select a service
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
      const chooseFilesButton = screen.getByText('Choose Files');
      expect(chooseFilesButton).toHaveClass('bg-blue-600', 'cursor-pointer');
    });
  });

  it('handles drag enter and leave events', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      const dropArea = screen.getByText('Drop images here or click to browse').closest('div');
      
      // Simulate drag enter
      fireEvent.dragEnter(dropArea);
      expect(dropArea).toHaveClass('border-blue-500', 'bg-blue-50');

      // Simulate drag leave
      fireEvent.dragLeave(dropArea);
      expect(dropArea).toHaveClass('border-gray-300');
    });
  });

  it('shows error when trying to upload without selecting service', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      const dropArea = screen.getByText('Drop images here or click to browse').closest('div');
      
      // Create a mock file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Simulate drop without selecting service
      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file]
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Please select a service before uploading images')).toBeInTheDocument();
    });
  });

  it('validates file types and sizes', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      // Select a service first
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });
    });

    const dropArea = screen.getByText('Drop images here or click to browse').closest('div');
    
    // Test invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: [invalidFile]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('test.txt is not a valid image file')).toBeInTheDocument();
    });
  });

  it('displays portfolio images with correct information', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('Wedding Photo 1')).toBeInTheDocument();
      expect(screen.getByText('Wedding Photo 2')).toBeInTheDocument();
      expect(screen.getByText('Family Portrait')).toBeInTheDocument();
    });

    // Check for primary badge
    expect(screen.getAllByText('Primary')).toHaveLength(2);
  });

  it('shows delete button on image hover', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    // The delete buttons are in the hover overlay, so they should be present in the DOM
    const deleteButtons = screen.getAllByTitle('Delete image');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('handles image deletion with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<PortfolioManager />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete image');
      fireEvent.click(deleteButtons[0]);
    });

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this image?');

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('cancels deletion when user clicks cancel', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(<PortfolioManager />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByTitle('Delete image');
      const initialImageCount = screen.getAllByRole('img').length;
      
      fireEvent.click(deleteButtons[0]);
      
      // Image count should remain the same
      expect(screen.getAllByRole('img')).toHaveLength(initialImageCount);
    });

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('shows empty state when no portfolio items exist', async () => {
    apiService.services.getAll.mockResolvedValue({
      data: { services: [] }
    });

    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('No portfolio images')).toBeInTheDocument();
      expect(screen.getByText('Upload images to showcase your work and attract customers.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    apiService.services.getAll.mockRejectedValue(new Error('API Error'));

    render(<PortfolioManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load portfolio data')).toBeInTheDocument();
    });
  });

  it('shows uploading state during file upload', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      // Select a service
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });
    });

    const dropArea = screen.getByText('Drop images here or click to browse').closest('div');
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: [validFile]
      }
    });

    // Should show uploading state
    await waitFor(() => {
      expect(screen.getByText('Uploading images...')).toBeInTheDocument();
    });
  });

  it('handles image load errors with fallback', async () => {
    render(<PortfolioManager />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      
      // Simulate image load error
      fireEvent.error(images[0]);
      
      // Should set fallback src (base64 placeholder)
      expect(images[0].src).toContain('data:image/svg+xml;base64');
    });
  });
});