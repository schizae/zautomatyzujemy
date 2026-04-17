import { ImageResponse } from 'next/og'

export const alt = 'Zautomatyzujemy.pl — AI i automatyzacja dla firm'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#121412',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            width: 64,
            height: 6,
            background: '#70e5ea',
            borderRadius: 3,
            marginBottom: 40,
          }}
        />

        {/* Domain */}
        <div
          style={{
            color: '#70e5ea',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          ZAUTOMATYZUJEMY.PL
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 36,
          }}
        >
          AI i automatyzacja
          {'\n'}dla Twojej firmy
        </div>

        {/* Tags */}
        <div
          style={{
            color: '#9ca3af',
            fontSize: 26,
            letterSpacing: 1,
          }}
        >
          Chatboty · Integracje n8n · RAG · AI Act
        </div>
      </div>
    ),
    { ...size },
  )
}
