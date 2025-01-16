/** @type {import('next').NextConfig} */
const nextConfiguration = {
  output: 'export',
  compiler: {
    styledComponents: true
  },
  experimental: {
    swcPlugins: [
      ['@lingui/swc-plugin', {
        // Optional
        // Unlike the JS version this option must be passed as object only.
        // Docs https://lingui.dev/ref/conf#runtimeconfigmodule
        "runtimeModules": {
          "i18n": ["@lingui/core", "i18n"],
          "trans": ["@lingui/react", "Trans"]
        }
      }],
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
    ],
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['curve-ui-kit'],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader']
    })

    return config
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    // ignoreBuildErrors: true,
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  openAnalyzer: false,
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfiguration)
