/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // API configuration removed - using direct calls to backend

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // App directory is now stable in Next.js 14
  // No experimental flags needed
};

module.exports = nextConfig;