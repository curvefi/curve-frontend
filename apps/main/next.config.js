/** @type {import('next').NextConfig} */
const nextConfiguration = {
  // reactStrictMode: false, // uncomment to disable React's Strict Mode when testing page load
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
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack']
    })
    return config
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true, // speed up the build, lint ci job is now marked as required
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
    source: '/dex/integrations',
    destination: '/dex/ethereum/integrations/',
    permanent: false
  }, {
    source: '/integrations',
    destination: '/dex/ethereum/integrations/',
    permanent: false
  }, {
    source: '/dex/:network',
    destination: '/dex/:network/pools/',
    permanent: false
  }, {
    source: '/crvusd/:network/beta-markets',
    destination: '/llamalend/:network/markets/',
    permanent: false
  }, {
    source: '/llamalend',
    destination: '/llamalend/ethereum/markets/',
    permanent: false
  }, {
    source: '/llamalend/:network',
    destination: '/llamalend/:network/markets/',
    permanent: false
  }, {
    source: '/crvusd/:network',
    destination: '/crvusd/:network/markets/',
    permanent: false
  }, {
    source: '/lend/:network',
    destination: '/lend/:network/markets/',
    permanent: false
  }, {
    source: '/dao/:network',
    destination: '/dao/:network/proposals/',
    permanent: false
  }, {
    // DAO doesn't have an integrations page, but the link is in the footer. Redirect to dex.
    source: '/dao/:network/integrations',
    destination: '/dex/:network/integrations/',
    permanent: false
  }],
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  openAnalyzer: false,
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfiguration)
