/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
