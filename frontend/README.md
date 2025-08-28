# Marketplace Frontend

This is the React frontend application for the Marketplace platform that connects service vendors with customers.

## Features

- **React 18** with JavaScript
- **React Router** for client-side routing
- **Context API** for state management
- **Axios** for API communication
- **Protected Routes** with role-based access control
- **Responsive Design** with custom CSS utilities

## Getting Started

### Prerequisites

- Node.js (version 20.19+ or 22.12+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL:
```
REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.jsx
├── contexts/           # React Context providers
│   ├── AuthContext.jsx    # Authentication state management
│   └── AppContext.jsx     # Global application state
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── MarketplaceHome.jsx
│   ├── ServiceSearch.jsx
│   ├── VendorProfile.jsx
│   ├── CustomerDashboard.jsx
│   ├── VendorDashboard.jsx
│   ├── BookingFlow.jsx
│   ├── Unauthorized.jsx
│   └── NotFound.jsx
├── services/           # API service layer
│   └── api.jsx
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
├── App.css            # Global styles
└── index.css          # Base styles
```

## State Management

The application uses React Context API for state management:

### AuthContext
- User authentication state
- Login/logout functionality
- JWT token management
- User profile information

### AppContext
- Global application state
- Notifications
- Search filters
- Loading states
- Error handling

## API Integration

The application communicates with the Rails backend through a centralized API service:

- **Authentication**: Login, register, logout
- **Services**: CRUD operations for service listings
- **Vendors**: Vendor profiles and information
- **Bookings**: Booking management
- **File Uploads**: Image and document uploads

## Routing

The application uses React Router with the following route structure:

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/marketplace` - Public marketplace
- `/services` - Service search
- `/vendors/:id` - Vendor profile
- `/customer/dashboard` - Customer dashboard (protected)
- `/vendor/dashboard` - Vendor dashboard (protected)
- `/booking/:serviceId` - Booking flow (protected)

## Authentication

The application implements JWT-based authentication with:

- Automatic token refresh
- Protected routes based on user roles
- Persistent login state
- Automatic logout on token expiration

## Future Enhancements

This is the foundation setup. Future tasks will implement:

- Complete UI components
- Advanced search functionality
- Real-time messaging
- Payment integration
- File upload capabilities
- Notification system
- Performance optimizations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3000/api/v1` |
| `REACT_APP_NAME` | Application name | `Marketplace` |
| `REACT_APP_VERSION` | Application version | `1.0.0` |