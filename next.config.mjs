/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'groovy-cassowary-529.convex.cloud',
            port: '',
          },
        ],
      },
};

export default nextConfig;
