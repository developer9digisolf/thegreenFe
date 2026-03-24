/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages only when necessary (Ant Design needs this due to ES modules)
  transpilePackages: ['@ant-design/icons'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    // Remove PropTypes from production build
    removeReactProperties: true
  },
  swcMinify: true,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.snapshot = {
      ...(config.snapshot ?? {}),
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@next)/]
    }

    // Optimize moment.js locale imports (if moment is used)
    config.resolve.alias = {
      ...config.resolve.alias,
    }

    return config
  },
  typescript: {
    ignoreBuildErrors: true
  },
  distDir: 'dist',
  productionBrowserSourceMaps: false,
  images: {
    domains: []
  },
  env: {
    STORAGE_ENCRYPTION_KEY: 'example2x0x2x3',
    ENCRYPTION_PREF_KEY: 'xxlSIOACC2733cjsjhaj',
    BASEURL: 'http://localhost:5100/api/',
  },
  async rewrites() {
    return {}
  }
}

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfig)