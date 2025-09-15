import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.selstorage.ru', // wildcard для всех поддоменов
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
