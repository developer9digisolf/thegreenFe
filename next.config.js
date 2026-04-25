/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages only when necessary (Ant Design needs this due to ES modules)
  transpilePackages: [
    "@ant-design/icons",
    "rc-util",
    "rc-pagination",
    "rc-picker",
    "rc-tree",
    "rc-menu",
    "rc-tooltip",
    "rc-table",
    "rc-virtual-list",
  ],
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
          exclude: ["error", "warn"],
        }
        : false,
  },
  compress: true,
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: "dist",
  productionBrowserSourceMaps: false,
  images: {
    domains: [],
  },
  env: {
    STORAGE_ENCRYPTION_KEY: process.env.STORAGE_ENCRYPTION_KEY || "example2x0x2x3",
    ENCRYPTION_PREF_KEY: process.env.ENCRYPTION_PREF_KEY || "xxlSIOACC2733cjsjhaj",
    BASEURL: process.env.NEXT_PUBLIC_BASEURL || "/api/",
  },
  // Di next.config.js
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_DESTINATION || "https://green-api-staging.digisolf.com"}/api/:path*`,
      },
    ];
  },
};

// Bundle analyzer configuration
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
