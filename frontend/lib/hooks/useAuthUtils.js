import { useAuth } from '../contexts/AuthContext';
import { tokenService } from '../tokenService';

/**
 * Custom hook that provides authentication utility functions
 */
export const useAuthUtils = () => {
  const { user, isAuthenticated, logout } = useAuth();

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  /**
   * Check if user is a customer
   */
  const isCustomer = () => {
    return hasRole('customer');
  };

  /**
   * Check if user is a vendor
   */
  const isVendor = () => {
    return hasRole('vendor');
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Get user's full name
   */
  const getFullName = () => {
    if (!user) return '';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  };

  /**
   * Get user's initials
   */
  const getInitials = () => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  const isTokenExpiringSoon = () => {
    const payload = tokenService.getTokenPayload();
    if (!payload) return false;

    const currentTime = Date.now() / 1000;
    const expirationTime = payload.exp;
    const fiveMinutes = 5 * 60; // 5 minutes in seconds

    return (expirationTime - currentTime) <= fiveMinutes;
  };

  /**
   * Get time until token expires (in seconds)
   */
  const getTimeUntilExpiration = () => {
    const payload = tokenService.getTokenPayload();
    if (!payload) return 0;

    const currentTime = Date.now() / 1000;
    const expirationTime = payload.exp;

    return Math.max(0, expirationTime - currentTime);
  };

  /**
   * Logout and redirect to login page
   */
  const logoutAndRedirect = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  /**
   * Check if user can access a specific route based on role
   */
  const canAccessRoute = (requiredRole) => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true;
    return hasRole(requiredRole);
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isCustomer,
    isVendor,
    isAdmin,
    getFullName,
    getInitials,
    isTokenExpiringSoon,
    getTimeUntilExpiration,
    logoutAndRedirect,
    canAccessRoute,
  };
};

export default useAuthUtils;