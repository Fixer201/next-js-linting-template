import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
]

const nextConfig: NextConfig = {
  headers() {
    return Promise.resolve([{ headers: securityHeaders, source: '/:path*' }])
  },
  poweredByHeader: false,
  reactCompiler: true,
  turbopack: {
    root: import.meta.dirname,
  },
  typedRoutes: true,
}

export default nextConfig
