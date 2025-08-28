# Authentication System

This directory contains the complete authentication system for the marketplace application, including JWT token management, user authentication, and role-based access control.

## Components

### AuthContext (`src/contexts/AuthContext.jsx`)
The main authentication context that provides:
- User authentication state management
- Login/register/logout functionality
- JWT token handling with automatic expiration checking
- Error handling and loading states

### TokenService (`src/services/tokenService.js`)
A service class that handles:
- JWT token storage and retrieval
- Token expiration checking
- User data persistence
- Secure token management

### ProtectedRoute (`src/components/ProtectedRoute.jsx`)
A route wrapper component that:
- Protects routes from unauthorized access
- Implements role-based access control
- Shows loading states during authentication checks
- Redirects to appropriate pages based on auth status

### Authentication Pages
- **Login** (`src/pages/Login.jsx`): User login form with validation
- **Register** (`src/pages/Register.jsx`): User registration with role selection

### Utility Hooks
- **useAuthUtils** (`src/hooks/useAuthUtils.js`): Provides utility functions for authentication checks, user information, and token management

## Features

### JWT Token Management
- Automatic token storage in localStorage
- Token expiration checking
- Refresh token support (when available)
- Secure token validation

### Role-Based Access Control
- Support for customer, vendor, and admin roles
- Route-level protection
- Component-level role checking
- Flexible permission system

### User Authentication
- Email/password login
- User registration with role selection
- Automatic login after registration
- Secure logout with token cleanup

### Error Handling
- Comprehensive error messages
- Network error handling
- Token expiration handling
- Form validation errors

## Usage

### Basic Setup
```jsx
import { AuthProvider } from './contexts/AuthContext.jsx';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Your app components */}
      </Router>
    </AuthProvider>
  );
}
```

### Using Authentication in Components
```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes
```jsx
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// Protect any route
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Protect with role requirement
<Route 
  path="/vendor/dashboard" 
  element={
    <ProtectedRoute requiredRole="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  } 
/>
```

### Using Authentication Utilities
```jsx
import { useAuthUtils } from '../hooks/useAuthUtils.js';

function UserProfile() {
  const { 
    isVendor, 
    isCustomer, 
    getFullName, 
    getInitials,
    isTokenExpiringSoon 
  } = useAuthUtils();

  return (
    <div>
      <h1>{getFullName()}</h1>
      <div className="avatar">{getInitials()}</div>
      {isVendor() && <VendorTools />}
      {isCustomer() && <CustomerTools />}
      {isTokenExpiringSoon() && <TokenExpirationWarning />}
    </div>
  );
}
```

## API Integration

The authentication system integrates with the backend API through:

### Login Endpoint
```javascript
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "user": { ... },
  "token": "jwt_token",
  "refresh_token": "refresh_token" // optional
}
```

### Register Endpoint
```javascript
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "password_confirmation": "password",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer" // or "vendor"
}

Response:
{
  "user": { ... },
  "token": "jwt_token",
  "refresh_token": "refresh_token" // optional
}
```

### Logout Endpoint
```javascript
DELETE /api/v1/auth/logout
Authorization: Bearer jwt_token
```

## Security Features

### Token Security
- JWT tokens are stored securely in localStorage
- Automatic token expiration checking
- Token cleanup on logout
- Secure token transmission

### Request Security
- Automatic token attachment to API requests
- 401 error handling with automatic logout
- HTTPS enforcement for production

### Role-Based Security
- Server-side role validation
- Client-side role checking for UX
- Route-level protection
- Component-level access control

## Testing

The authentication system includes comprehensive tests:

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: Authentication flow testing
- **Hook Tests**: Custom hook functionality testing
- **Component Tests**: UI component behavior testing

Run tests with:
```bash
npm run test
```

## Error Handling

The system handles various error scenarios:

### Authentication Errors
- Invalid credentials
- Account not found
- Email already exists
- Password validation errors

### Token Errors
- Expired tokens
- Invalid tokens
- Missing tokens
- Malformed tokens

### Network Errors
- Connection failures
- Server errors
- Timeout errors

## Best Practices

### Security
- Always validate tokens on the server side
- Use HTTPS in production
- Implement proper CORS policies
- Regular token rotation

### User Experience
- Show loading states during authentication
- Provide clear error messages
- Remember user preferences
- Smooth navigation after login/logout

### Performance
- Lazy load authentication components
- Minimize token validation calls
- Cache user data appropriately
- Optimize re-renders

## Configuration

### Environment Variables
```bash
REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Token Configuration
- Default token expiration: Based on server configuration
- Token refresh: Automatic when refresh token is available
- Storage: localStorage (can be configured for different storage methods)

## Troubleshooting

### Common Issues

1. **Token Expiration**: Tokens expire and users are logged out
   - Solution: Implement token refresh or extend token lifetime

2. **Role Access Denied**: Users can't access certain routes
   - Solution: Check user role assignment and route configuration

3. **Login Redirect Loop**: Users get stuck in redirect loops
   - Solution: Check protected route configuration and authentication state

4. **API Connection Issues**: Authentication fails due to network issues
   - Solution: Implement retry logic and better error handling

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('auth_debug', 'true');
```

This will log authentication events to the console for debugging purposes.