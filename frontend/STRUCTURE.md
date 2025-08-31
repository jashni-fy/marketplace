# Frontend Structure - Next.js 13+ App Router

This document outlines the new frontend structure following Next.js 13+ App Router conventions.

## Directory Structure

```
frontend/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── login/
│   │   └── page.tsx       # Login page
│   ├── register/
│   │   └── page.tsx       # Register page
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard page
│   └── [other routes]/
│
├── components/             # Shared UI components
│   ├── BookingCalendar.jsx
│   ├── PortfolioManager.jsx
│   ├── ProtectedRoute.jsx
│   ├── ServiceManagement.jsx
│   └── pages/             # Page-specific components
│       ├── Home.tsx
│       ├── Login.tsx
│       └── Register.tsx
│
├── lib/                   # Client helpers and utilities
│   ├── api.js            # API service layer
│   ├── tokenService.js   # Token management
│   └── contexts/         # React contexts
│       ├── AuthContext.jsx
│       └── AppContext.jsx
│
├── public/               # Static assets
│   └── [images, icons, etc.]
│
├── styles/               # Global & module CSS
│   └── globals.css       # Global styles with Tailwind
│
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Key Changes from Previous Structure

### 1. App Router Structure
- Moved from `src/` based structure to Next.js 13+ App Router
- Pages are now in `app/` directory with `page.tsx` files
- Layout is defined in `app/layout.tsx`

### 2. Component Organization
- Shared components moved to `components/` directory
- Page-specific components in `components/pages/`
- Removed `.jsx` extensions in favor of `.tsx` for TypeScript

### 3. Library Structure
- Services and utilities moved to `lib/` directory
- Contexts moved to `lib/contexts/`
- API services in `lib/api.js`
- Token management in `lib/tokenService.js`

### 4. Styling
- Global styles moved to `styles/globals.css`
- Includes Tailwind CSS directives
- Dark theme support maintained

### 5. TypeScript Configuration
- Updated path mappings in `tsconfig.json`
- New aliases:
  - `@/components/*` → `./components/*`
  - `@/lib/*` → `./lib/*`
  - `@/app/*` → `./app/*`
  - `@/styles/*` → `./styles/*`

## Migration Benefits

1. **Modern Next.js**: Uses the latest App Router for better performance
2. **Better Organization**: Clear separation of concerns
3. **TypeScript Ready**: Proper TypeScript setup with path mappings
4. **Scalable**: Easy to add new components and pages
5. **Maintainable**: Logical file organization

## Usage Examples

### Importing Components
```typescript
// Old way
import { useAuth } from '../src/contexts/AuthContext';
import { apiService } from '../src/services/api';

// New way
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiService } from '@/lib/api';
```

### Creating New Pages
```typescript
// app/new-page/page.tsx
import MyComponent from '@/components/MyComponent';

export default function NewPage() {
  return <MyComponent />;
}
```

### Adding Components
```typescript
// components/MyComponent.tsx
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MyComponent() {
  const { user } = useAuth();
  return <div>Hello {user?.name}</div>;
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Notes

- All components are now TypeScript-ready
- Server-side rendering is enabled by default
- Client components are marked with `'use client'` directive
- Protected routes use the `ProtectedRoute` component
- Authentication context is available throughout the app