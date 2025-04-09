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
    source: '/dex/:network',
    destination: '/dex/:network/pools',
    permanent: false
  }, {
    source: '/crvusd/:network',
    destination: '/crvusd/:network/markets',
    permanent: false
  }, {
    source: '/lend/:network',
    destination: '/lend/:network/markets',
    permanent: false
  }, {
    source: '/dao/:network',
    destination: '/dao/:network/proposals',
    permanent: false
  }, {
    // DAO doesn't have an integrations page, but the link is in the footer. Redirect to dex.
    source: '/dao/:network/integrations',
    destination: '/dex/:network/integrations',
    permanent: false
  }],
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  openAnalyzer: false,
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfiguration)
