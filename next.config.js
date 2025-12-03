/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/prompt-database',
}

module.exports = nextConfig

