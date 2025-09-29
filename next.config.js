/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/farcaster.json',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=1, stale-while-revalidate' },
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
