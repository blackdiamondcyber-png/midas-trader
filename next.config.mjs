/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base = process.env.TRADING_API_URL || 'http://localhost:8765'
    return [
      { source: '/api/trading/strategies/:path*', destination: `${base}/api/strategies/:path*` },
      { source: '/api/trading/eval-status', destination: `${base}/api/eval-status` },
      { source: '/api/trading/:path*', destination: `${base}/:path*` },
    ]
  },
}
export default nextConfig
