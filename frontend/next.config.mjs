/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/sitemap.xml',
        destination: `${backendUrl}/api/sitemap.xml`,
      },
    ];
  },
};

export default nextConfig;
