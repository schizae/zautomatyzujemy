import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const securityHeaders = [
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // microphone=(self): wymagane przez widget głosowy. (self) otwiera dostęp
  // wyłącznie dla własnego origin, nie dla osadzonych ramek osób trzecich.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // blob: jest wymagane przez AudioWorklet: Daily ładuje filtr szumów Krisp
      // i miernik poziomu dźwięku jako moduły worklet z blob: URL. Worklety audio
      // podlegają pod script-src, NIE pod worker-src — bez tego mikrofon jest
      // przechwytywany, ale procesor się nie inicjuje i audio nie idzie dalej.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://i.ibb.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://o4511235084910592.ingest.de.sentry.io https://api.vapi.ai https://*.daily.co wss://*.daily.co",
      // Widget głosowy: Vapi opakowuje Daily, które ładuje 'call machine'
      // w ramce z c.daily.co i sygnalizuje przez gs.daily.co.
      // 'self' powtórzone celowo — podanie frame-src wyłącza fallback do default-src.
      "frame-src 'self' https://*.daily.co",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'zautomatyzujemy',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  telemetry: false,
  // Source maps upload wymaga SENTRY_AUTH_TOKEN — można dodać później
  sourcemaps: { disable: true },
})
