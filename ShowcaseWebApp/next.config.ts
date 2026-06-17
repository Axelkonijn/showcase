import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bouwt een zelfstandige server-output (.next/standalone) voor een slanke productie-image.
  // Heeft geen effect op `next dev`.
  output: "standalone",

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  async rewrites() {
    return [
      {
        // 1. Voor normale API calls
        source: '/api/:path*',
        destination: 'http://showcase-api:8080/:path*',
      },
      {
        // 2. NIEUW: Voor SignalR connecties
        source: '/hub/:path*',
        destination: 'http://showcase-api:8080/hub/:path*',
      },
    ];
  },
};

export default nextConfig;
