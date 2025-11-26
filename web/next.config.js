/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/containerized deployments
  output: 'standalone',

  // Image optimization settings
  images: {
    // Allow images from these domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Supported formats
    formats: ['image/avif', 'image/webp'],
  },

  // Strict mode for better debugging
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,
}

module.exports = nextConfig
