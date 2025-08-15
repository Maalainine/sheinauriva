/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'upload.wikimedia.org',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'source.unsplash.com',
      'localhost',
      'justoriginale.com',
      'www.justoriginale.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Enable server actions (if using Next.js 14+)
  experimental: {
    serverActions: true,
  },
  
  // Configure headers for all routes
  async headers() {
    const headers = [];
    
    // CORS headers for API routes
    headers.push({
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { 
          key: 'Access-Control-Allow-Methods', 
          value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' 
        },
        { 
          key: 'Access-Control-Allow-Headers',
          value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Signature',
        },
      ],
    });
    
    // Security headers for all pages
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/(.*)',
        headers: [
          // Security headers
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Strict-Transport-Security', 
            value: 'max-age=63072000; includeSubDomains; preload' 
          },
          { 
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      });
    }
    
    return headers;
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (
      process.env.NODE_ENV === 'production' 
        ? 'https://www.justoriginale.com' 
        : 'http://localhost:3000'
    ),
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  
  // Enable server source maps in development
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// Development-specific configuration
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  console.log('NEXTAUTH_URL:', nextConfig.env.NEXTAUTH_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
}

// Production-specific configuration
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode');
  
  // Disable source maps in production
  nextConfig.productionBrowserSourceMaps = false;
  
  // Enable compression
  nextConfig.compress = true;
  
  // Disable powered by header
  nextConfig.poweredByHeader = false;
}

module.exports = nextConfig;
