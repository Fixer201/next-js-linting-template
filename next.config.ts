import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const analyzer = withBundleAnalyzer({ enabled: process.env['ANALYZE'] === 'true' })

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
}

export default analyzer(nextConfig)
