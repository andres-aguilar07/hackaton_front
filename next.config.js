/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3000/api/v1/:path*' // Actualizado al puerto 3000
      }
    ]
  }
}

module.exports = nextConfig 