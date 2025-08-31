# Migration from Vite to Next.js

This document outlines the migration from Vite + React Router to Next.js App Router.

## Key Changes

### 1. **Project Structure**
```
Old (Vite):                    New (Next.js):
src/                          app/                    # App Router pages
├── main.jsx                  ├── layout.js          # Root layout
├── App.jsx                   ├── page.js            # Home page
├── pages/                    ├── login/page.js      # Login page
│   ├── Home.jsx             ├── register/page.js   # Register page
│   ├── Login.jsx            └── ...
│   └── ...                  src/                    # Shared components
└── components/              ├── components/         # React components
    └── ...                  ├── contexts/          # React contexts
                             ├── services/          # API services
                             └── utils/             # Utilities
```

### 2. **Routing**
- **Before**: React Router with `<Routes>` and `<Route>` components
- **After**: Next.js App Router with file-based routing

### 3. **Navigation**
- **Before**: `import { Link, useNavigate } from 'react-router-dom'`
- **After**: `import Link from 'next/link'` and `import { useRouter } from 'next/navigation'`

### 4. **Environment Variables**
- **Before**: `VITE_*` and `REACT_APP_*` prefixes
- **After**: `NEXT_PUBLIC_*` prefix for client-side variables

### 5. **Build System**
- **Before**: Vite bundler
- **After**: Next.js built-in bundler (Turbopack in dev, Webpack in production)

## Migration Steps Completed

### ✅ Configuration Files
- [x] Updated `package.json` with Next.js dependencies
- [x] Created `next.config.js`
- [x] Updated environment variables (`.env.example`, `.env.local`)
- [x] Created TypeScript config (`tsconfig.json`)
- [x] Updated ESLint config (`.eslintrc.json`)
- [x] Created Jest config (`jest.config.js`)

### ✅ App Structure
- [x] Created `app/` directory with App Router structure
- [x] Created `app/layout.js` as root layout
- [x] Migrated all pages to App Router format:
  - [x] Home (`app/page.js`)
  - [x] Login (`app/login/page.js`)
  - [x] Register (`app/register/page.js`)
  - [x] Marketplace (`app/marketplace/page.js`)
  - [x] Services (`app/services/page.js`)
  - [x] Vendor Profile (`app/vendors/[id]/page.js`)
  - [x] Customer Dashboard (`app/customer/dashboard/page.js`)
  - [x] Vendor Dashboard (`app/vendor/dashboard/page.js`)
  - [x] Booking Flow (`app/booking/[serviceId]/page.js`)
  - [x] Dashboard Redirect (`app/dashboard/page.js`)
  - [x] Unauthorized (`app/unauthorized/page.js`)
  - [x] 404 Page (`app/not-found.js`)

### ✅ Component Updates
- [x] Updated all components to use Next.js navigation:
  - [x] `Link` component from `next/link`
  - [x] `useRouter` from `next/navigation`
  - [x] `useSearchParams` for query parameters
- [x] Added `'use client'` directive to client components
- [x] Updated `ProtectedRoute` component for Next.js navigation

### ✅ Services & Contexts
- [x] Updated API service to use `NEXT_PUBLIC_API_URL`
- [x] Updated contexts to work with Next.js SSR
- [x] Fixed client-side only code with proper checks

### ✅ Docker & Deployment
- [x] Updated `Dockerfile` for Next.js production build
- [x] Updated `Dockerfile.dev` for Next.js development
- [x] Updated `docker-compose.yml` with correct ports and environment
- [x] Updated nginx configuration for Next.js

### ✅ Build & Development
- [x] Removed Vite-specific files (`vite.config.js`, `index.html`)
- [x] Updated build scripts in `package.json`
- [x] Created proper Next.js development setup

## Benefits of Next.js Migration

### 🚀 **Performance**
- **Server-Side Rendering (SSR)**: Better SEO and initial page load
- **Static Site Generation (SSG)**: Pre-rendered pages for better performance
- **Automatic Code Splitting**: Smaller bundle sizes
- **Image Optimization**: Built-in `next/image` component
- **Font Optimization**: Automatic font loading optimization

### 🛠️ **Developer Experience**
- **File-based Routing**: Intuitive routing system
- **Built-in TypeScript Support**: No additional configuration needed
- **Hot Module Replacement**: Fast development feedback
- **Built-in ESLint**: Code quality enforcement
- **API Routes**: Full-stack capabilities in one framework

### 📱 **Modern Features**
- **App Router**: Latest Next.js routing system
- **React Server Components**: Better performance and UX
- **Streaming**: Progressive page loading
- **Middleware**: Request/response manipulation
- **Edge Runtime**: Deploy to edge locations

### 🔧 **Production Ready**
- **Automatic Optimization**: Bundle splitting, tree shaking, minification
- **Built-in Analytics**: Performance monitoring
- **Security Headers**: Automatic security best practices
- **Deployment Integration**: Seamless Vercel deployment

## Development Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
```

## Environment Setup

1. **Install dependencies**:
   ```bash
   cd marketplace/frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## Docker Setup

```bash
# Development with Docker
docker-compose up frontend

# Production build
docker build -t marketplace-frontend .
docker run -p 3000:3000 marketplace-frontend
```

## Key Differences for Developers

### Navigation
```javascript
// Before (React Router)
import { Link, useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// After (Next.js)
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

### Environment Variables
```javascript
// Before (Vite)
const apiUrl = import.meta.env.VITE_API_URL;

// After (Next.js)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Client-Side Code
```javascript
// Before (always client-side)
const MyComponent = () => {
  const [data, setData] = useState(null);
  // ...
};

// After (mark as client component if needed)
'use client';
const MyComponent = () => {
  const [data, setData] = useState(null);
  // ...
};
```

## Troubleshooting

### Common Issues

1. **"useRouter" not working**: Make sure to import from `next/navigation`, not `next/router`
2. **Environment variables undefined**: Ensure they start with `NEXT_PUBLIC_` for client-side access
3. **Hydration errors**: Add `'use client'` directive to components using browser APIs
4. **404 on refresh**: Next.js handles this automatically with App Router

### Performance Tips

1. Use `next/image` for optimized images
2. Use `next/font` for optimized fonts
3. Implement proper loading states
4. Use React Suspense for better UX
5. Consider Server Components for data fetching

## Next Steps

1. **Implement Server Components**: Move data fetching to server components where appropriate
2. **Add Middleware**: Implement authentication middleware
3. **Optimize Images**: Replace `<img>` tags with `next/image`
4. **Add Metadata**: Implement proper SEO metadata for each page
5. **Performance Monitoring**: Set up Next.js analytics
6. **Edge Functions**: Consider edge runtime for API routes