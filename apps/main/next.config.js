/** @type {import('next').NextConfig} */
const nextConfiguration = {
  compiler: {
    styledComponents: true
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
  // todo: make permanent=true once it all works fine in production. Otherwise it's hard to revert changes!
  redirects: async () => [{
    source: '/dex/ethereum',
    destination: '/dex/ethereum/pools',
    permanent: false
  }, {
    source: '/crvusd/ethereum',
    destination: '/crvusd/ethereum/markets',
    permanent: false
  }, {
    source: '/lend/ethereum',
    destination: '/lend/ethereum/markets',
    permanent: false
  }, {
    source: '/dao/ethereum',
    destination: '/dao/ethereum/proposals',
    permanent: false
  }],
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  openAnalyzer: false,
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfiguration)
