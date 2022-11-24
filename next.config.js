/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { esmExternals: false },
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NINJA_APIKEY: process.env.NINJA_APIKEY,
  }
}

module.exports = nextConfig
