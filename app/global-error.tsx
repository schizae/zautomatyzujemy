'use client'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, backgroundColor: '#0d0f0d', color: '#e2e3df', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '3.75rem', fontWeight: 900, color: '#70e5ea' }}>Ups!</p>
          <h1 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
            Wystąpił krytyczny błąd
          </h1>
          <p style={{ marginTop: '0.75rem', color: '#bcc9c9', maxWidth: '28rem', lineHeight: 1.6 }}>
            Przepraszamy za utrudnienia. Spróbuj odświeżyć stronę.
            {error.digest && (
              <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#3d4949' }}>
                Kod błędu: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '2rem',
              borderRadius: '9999px',
              backgroundColor: '#70e5ea',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#003739',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Spróbuj ponownie
          </button>
        </main>
      </body>
    </html>
  )
}
