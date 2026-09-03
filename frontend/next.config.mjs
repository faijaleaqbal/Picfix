/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4100';
    return [
      {
        source: '/api/passport-photo/:path*',
        destination: `${backendUrl}/api/passport-photo/:path*`,
      },
      {
        source: '/api/compress/:path*',
        destination: `${backendUrl}/api/compress/:path*`,
      },
      {
        source: '/api/resize/:path*',
        destination: `${backendUrl}/api/resize/:path*`,
      },
      {
        source: '/api/crop/:path*',
        destination: `${backendUrl}/api/crop/:path*`,
      },
      {
        source: '/api/convert-format/:path*',
        destination: `${backendUrl}/api/convert-format/:path*`,
      },
      {
        source: '/api/social-resize/:path*',
        destination: `${backendUrl}/api/social-resize/:path*`,
      },
      {
        source: '/api/social-presets/:path*',
        destination: `${backendUrl}/api/social-presets/:path*`,
      },
      {
        source: '/api/flip/:path*',
        destination: `${backendUrl}/api/flip/:path*`,
      },
      {
        source: '/api/rotate/:path*',
        destination: `${backendUrl}/api/rotate/:path*`,
      },
      {
        source: '/api/grayscale/:path*',
        destination: `${backendUrl}/api/grayscale/:path*`,
      },
      {
        source: '/api/add-text/:path*',
        destination: `${backendUrl}/api/add-text/:path*`,
      },
      {
        source: '/api/add-watermark/:path*',
        destination: `${backendUrl}/api/add-watermark/:path*`,
      },
      {
        source: '/api/pdf/:path*',
        destination: `${backendUrl}/api/pdf/:path*`,
      },
      {
        source: '/api/ai/:path*',
        destination: `${backendUrl}/api/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;