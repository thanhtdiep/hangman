/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NINJA_APIKEY: process.env.NINJA_APIKEY,
  }
}

module.exports = nextConfig
