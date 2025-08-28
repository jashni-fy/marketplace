import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';
import { apiService } from '../../services/api.jsx';
import { tokenService } from '../../services/tokenService.js';

// Mock dependencies
vi.mock('../../services/api.jsx', () => ({
  apiService: {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

vi.mock('../../services/tokenService.js', () => ({
  tokenService: {
    getToken: vi.fn(),
    getUser: vi.fn(),
    setToken: vi.fn(),
    setUser: vi.fn(),
    setRefreshToken: vi.fn(),
    clearAuthData: vi.fn(),
    isTokenExpired: vi.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{auth.isLoading.toString()}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'null'}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <button onClick={() => auth.login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => auth.register({ email: 'test@example.com', password: 'password' })}>
        Register
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.clearError()}>Clear Error</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', () => {
      tokenService.getToken.mockReturnValue(null);
      tokenService.getUser.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('should load user from storage on mount', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      tokenService.getToken.mockReturnValue('mock-token');
      tokenService.getUser.mockReturnValue(mockUser);
      tokenService.isTokenExpired.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('should clear expired token on mount', async () => {
      tokenService.getToken.mockReturnValue('expired-token');
      tokenService.getUser.mockReturnValue({ id: 1, email: 'test@example.com' });
      tokenService.isTokenExpired.mockReturnValue(true);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(tokenService.clearAuthData).toHaveBeenCalled();
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'mock-token';
      
      tokenService.getToken.mockReturnValue(null);
      tokenService.getUser.mockReturnValue(null);
      
      apiService.auth.login.mockResolvedValue({
        data: { user: mockUser, token: mockToken }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(apiService.auth.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password'
        });
        expect(tokenService.setToken).toHaveBeenCalledWith(mockToken);
        expect(tokenService.setUser).toHaveBeenCalledWith(mockUser);
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('should handle login failure', async () => {
      tokenService.getToken.mockReturnValue(null);
      tokenService.getUser.mockReturnValue(null);
      
      apiService.auth.login.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'mock-token';
      
      tokenService.getToken.mockReturnValue(null);
      tokenService.getUser.mockReturnValue(null);
      
      apiService.auth.register.mockResolvedValue({
        data: { user: mockUser, token: mockToken }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByText('Register');
      registerButton.click();

      await waitFor(() => {
        expect(apiService.auth.register).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password'
        });
        expect(tokenService.setToken).toHaveBeenCalledWith(mockToken);
        expect(tokenService.setUser).toHaveBeenCalledWith(mockUser);
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should handle register failure', async () => {
      tokenService.getToken.mockReturnValue(null);
      tokenService.getUser.mockReturnValue(null);
      
      apiService.auth.register.mockRejectedValue({
        response: { data: { message: 'Email already exists' } }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByText('Register');
      registerButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Email already exists');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      tokenService.getToken.mockReturnValue('mock-token');
      tokenService.getUser.mockReturnValue(mockUser);
      tokenService.isTokenExpired.mockReturnValue(false);
      
      apiService.auth.logout.mockResolvedValue({});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(apiService.auth.logout).toHaveBeenCalled();
        expect(tokenService.clearAuthData).toHaveBeenCalled();
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });

    it('should logout even if API call fails', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      tokenService.getToken.mockReturnValue('mock-token');
      tokenService.getUser.mockReturnValue(mockUser);
      tokenService.isTokenExpired.mockReturnValue(false);
      
      apiService.auth.logout.mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      const logoutButton = screen.getByText('Logout');
      logoutButton.click();

      await waitFor(() => {
        expect(tokenService.clearAuthData).toHaveBeenCalled();
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      tokenService.getToken.mockReturnValue(null);
      tokenService.getUser.mockReturnValue(null);
      
      apiService.auth.login.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Trigger error
      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });

      // Clear error
      const clearErrorButton = screen.getByText('Clear Error');
      clearErrorButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });
    });
  });
});

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    const TestComponentOutsideProvider = () => {
      useAuth();
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});