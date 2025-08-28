import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Mock the useAuth hook
vi.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state, replace }) => {
      mockNavigate(to, { state, replace });
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
  };
});

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderProtectedRoute = (props = {}) => {
  return render(
    <BrowserRouter>
      <ProtectedRoute {...props}>
        <TestComponent />
      </ProtectedRoute>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when loading', () => {
    it('should show loading spinner', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      });

      renderProtectedRoute();

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when not authenticated', () => {
    it('should redirect to login', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

      renderProtectedRoute();

      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { from: expect.any(Object) },
        replace: true,
      });
      expect(screen.getByTestId('navigate')).toHaveTextContent('Redirecting to /login');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    it('should render children when no role required', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'test@example.com', role: 'customer' },
        isLoading: false,
      });

      renderProtectedRoute();

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should render children when user has required role', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'test@example.com', role: 'vendor' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'vendor' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should redirect to unauthorized when user lacks required role', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'test@example.com', role: 'customer' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'vendor' });

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
      expect(screen.getByTestId('navigate')).toHaveTextContent('Redirecting to /unauthorized');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to unauthorized when user has no role but role is required', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'test@example.com' }, // No role property
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'vendor' });

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
      expect(screen.getByTestId('navigate')).toHaveTextContent('Redirecting to /unauthorized');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('role-based access control', () => {
    it('should allow customer access to customer routes', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'customer@example.com', role: 'customer' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'customer' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should allow vendor access to vendor routes', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'vendor@example.com', role: 'vendor' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'vendor' });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should allow admin access to any route', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'admin@example.com', role: 'admin' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'vendor' });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });

    it('should deny customer access to vendor routes', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'customer@example.com', role: 'customer' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'vendor' });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });

    it('should deny vendor access to customer routes', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, email: 'vendor@example.com', role: 'vendor' },
        isLoading: false,
      });

      renderProtectedRoute({ requiredRole: 'customer' });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', { replace: true });
    });
  });

  describe('loading states', () => {
    it('should show loading spinner with proper accessibility attributes', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      });

      renderProtectedRoute();

      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should center loading spinner', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      });

      renderProtectedRoute();

      const container = screen.getByRole('status', { hidden: true }).parentElement;
      expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
    });
  });
});