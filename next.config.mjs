/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['puppeteer'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  }
}

export default nextConfig
