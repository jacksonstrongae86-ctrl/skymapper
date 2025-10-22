/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For easier static export if needed
  },
  // Optimize for mobile
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
