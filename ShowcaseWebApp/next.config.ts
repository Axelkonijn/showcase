import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bouwt een zelfstandige server-output (.next/standalone) voor een slanke productie-image.
  // Heeft geen effect op `next dev`.
  output: "standalone",

  // Dev-only: sta toe dat de dev-resources (HMR + client-chunks) benaderd worden via
  // de proxy/containernamen i.p.v. alleen localhost. Geen effect op de productie-build.
  allowedDevOrigins: ["showcase-proxy", "showcase-webapp", "localhost"],

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
