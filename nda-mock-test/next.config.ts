import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
