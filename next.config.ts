import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Włącz MDX jeśli potrzebne w przyszłości
  // pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default nextConfig
