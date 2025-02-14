/** @type {import('next').NextConfig} */
const nextConfiguration = {
  compiler: { styledComponents: true },
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
  redirects: async () => [{
    source: '/',
    destination: '/dex',
    permanent: true
  }],
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  openAnalyzer: false,
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(nextConfiguration)
