/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: false
  },
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: config => {
    config.snapshot = {
      ...(config.snapshot ?? {}),
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@next)/]
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true
  },
  distDir: 'dist',
  images: {
    domains: [

    ]
  },
  env: {
    STORAGE_ENCRYPTION_KEY: 'example2x0x2x3',
    ENCRYPTION_PREF_KEY: 'xxlSIOACC2733cjsjhaj',
    BASEURL: 'https://localhost/v1/',
  },
  async rewrites() {
    return {}
  }
}

module.exports = nextConfig