import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force dev server to use webpack by configuring it
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
