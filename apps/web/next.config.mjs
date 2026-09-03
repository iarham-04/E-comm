/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/journal',
        destination: '/blog',
      },
      {
        source: '/journal/:slug',
        destination: '/blog/:slug',
      },
    ];
  },
};

export default nextConfig;
