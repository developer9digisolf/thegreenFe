/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/icons-svg', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-table', 'rc-tree', 'rc-select', 'rc-input', 'rc-field-form', 'rc-cascader', 'rc-checkbox', 'rc-collapse', 'rc-dialog', 'rc-drawer', 'rc-dropdown', 'rc-image', 'rc-menu', 'rc-motion', 'rc-notification', 'rc-progress', 'rc-rate', 'rc-resize-observer', 'rc-segmented', 'rc-slider', 'rc-steps', 'rc-switch', 'rc-tabs', 'rc-textarea', 'rc-tooltip', 'rc-tree-select', 'rc-upload', 'rc-virtual-list'],
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
    BASEURL: 'http://localhost:5100/api/',
  },
  async rewrites() {
    return {}
  }
}

module.exports = nextConfig