import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Remove output: 'export' for Firebase App Hosting compatibility
  // output: 'export',  // Commented out - not compatible with App Hosting
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Remove distDir for Firebase App Hosting - it manages the build output
  // distDir: 'out',  // Commented out - App Hosting manages this
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Keep unoptimized for external images but App Hosting can handle optimization
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
