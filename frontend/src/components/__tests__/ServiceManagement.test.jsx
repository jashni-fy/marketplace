import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ServiceManagement from '../ServiceManagement.jsx';
import { apiService } from '../../services/api.jsx';

// Mock the API service
vi.mock('../../services/api.jsx', () => ({
  apiService: {
    services: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }
}));

const mockServices = [
  {
    id: 1,
    name: 'Wedding Photography',
    description: 'Professional wedding photography services',
    base_price: 1500,
    formatted_price: '$1500',
    pricing_type: 'package',
    status: 'active',
    category: {
      id: 1,
      name: 'Photography',
      slug: 'photography'
    }
  },
  {
    id: 2,
    name: 'Portrait Session',
    description: 'Individual and family portrait sessions',
    base_price: 200,
    formatted_price: '$200/hour',
    pricing_type: 'hourly',
    status: 'draft',
    category: {
      id: 1,
      name: 'Photography',
      slug: 'photography'
    }
  }
];

const mockOnServiceUpdate = vi.fn();

describe('ServiceManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders service management interface', () => {
    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    expect(screen.getByText('Service Management')).toBeInTheDocument();
    expect(screen.getByText('Add New Service')).toBeInTheDocument();
  });

  it('displays services in a table', () => {
    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    expect(screen.getByText('Wedding Photography')).toBeInTheDocument();
    expect(screen.getByText('Portrait Session')).toBeInTheDocument();
    expect(screen.getByText('$1500')).toBeInTheDocument();
    expect(screen.getByText('$200/hour')).toBeInTheDocument();
  });

  it('shows status badges with correct colors', () => {
    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    const activeStatus = screen.getByText('active');
    const draftStatus = screen.getByText('draft');

    expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800');
    expect(draftStatus).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('opens service form when Add New Service is clicked', () => {
    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add New Service' });
    fireEvent.click(addButton);

    expect(screen.getByRole('heading', { name: 'Add New Service' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });

  it('opens edit form when Edit button is clicked', () => {
    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Service')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Wedding Photography')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Professional wedding photography services')).toBeInTheDocument();
  });

  it('creates new service when form is submitted', async () => {
    const mockResponse = {
      data: {
        service: {
          id: 3,
          name: 'Event Photography',
          description: 'Professional event photography for corporate and social events',
          base_price: 800,
          formatted_price: '$800',
          pricing_type: 'package',
          status: 'active',
          category: {
            id: 1,
            name: 'Photography',
            slug: 'photography'
          }
        }
      }
    };

    apiService.services.create.mockResolvedValue(mockResponse);

    render(
      <ServiceManagement 
        services={[]} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    // Open form
    const addButton = screen.getByRole('button', { name: 'Add New Service' });
    fireEvent.click(addButton);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Service Name/), {
      target: { value: 'Event Photography' }
    });
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'Professional event photography for corporate and social events' }
    });
    fireEvent.change(screen.getByLabelText(/Category/), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText(/Base Price/), {
      target: { value: '800' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create Service' }));

    await waitFor(() => {
      expect(apiService.services.create).toHaveBeenCalledWith({
        service: {
          name: 'Event Photography',
          description: 'Professional event photography for corporate and social events',
          service_category_id: 1,
          base_price: 800,
          pricing_type: 'hourly',
          status: 'draft'
        }
      });
    });

    expect(mockOnServiceUpdate).toHaveBeenCalled();
  });

  it('updates existing service when edit form is submitted', async () => {
    const mockResponse = {
      data: {
        service: {
          ...mockServices[0],
          name: 'Updated Wedding Photography'
        }
      }
    };

    apiService.services.update.mockResolvedValue(mockResponse);

    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    // Open edit form
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Update name
    const nameInput = screen.getByDisplayValue('Wedding Photography');
    fireEvent.change(nameInput, {
      target: { value: 'Updated Wedding Photography' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Update Service'));

    await waitFor(() => {
      expect(apiService.services.update).toHaveBeenCalledWith(1, {
        service: {
          name: 'Updated Wedding Photography',
          description: 'Professional wedding photography services',
          service_category_id: 1,
          base_price: 1500,
          pricing_type: 'package',
          status: 'active'
        }
      });
    });

    expect(mockOnServiceUpdate).toHaveBeenCalled();
  });

  it('deletes service when delete button is clicked and confirmed', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    apiService.services.delete.mockResolvedValue({});

    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(apiService.services.delete).toHaveBeenCalledWith(1);
    });

    expect(mockOnServiceUpdate).toHaveBeenCalled();

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('does not delete service when deletion is cancelled', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(apiService.services.delete).not.toHaveBeenCalled();
    expect(mockOnServiceUpdate).not.toHaveBeenCalled();

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('shows empty state when no services exist', () => {
    render(
      <ServiceManagement 
        services={[]} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    expect(screen.getByText('No services')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first service.')).toBeInTheDocument();
  });

  it('handles form validation for required fields', () => {
    render(
      <ServiceManagement 
        services={[]} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Add New Service'));

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Service'));

    // Form should not be submitted (no API call)
    expect(apiService.services.create).not.toHaveBeenCalled();
  });

  it('closes form when cancel button is clicked', () => {
    render(
      <ServiceManagement 
        services={mockServices} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    // Open form
    const addButton = screen.getByRole('button', { name: 'Add New Service' });
    fireEvent.click(addButton);
    expect(screen.getByRole('heading', { name: 'Add New Service' })).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // Form should be closed
    expect(screen.queryByLabelText(/Service Name/)).not.toBeInTheDocument();
  });

  it('handles custom pricing type correctly', () => {
    render(
      <ServiceManagement 
        services={[]} 
        onServiceUpdate={mockOnServiceUpdate} 
      />
    );

    // Open form
    const addButton = screen.getByRole('button', { name: 'Add New Service' });
    fireEvent.click(addButton);

    // Select custom pricing
    fireEvent.change(screen.getByLabelText(/Pricing Type/), {
      target: { value: 'custom' }
    });

    // Base price field should not be visible for custom pricing
    expect(screen.queryByLabelText(/Base Price/)).not.toBeInTheDocument();
  });
});