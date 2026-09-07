import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://d506e3535bcc685bacef3194935d9afc@o4511235084910592.ingest.de.sentry.io/4511235131965520',

  tracesSampleRate: 0.1,

  // Wylaczone poza produkcja — lokalny `next dev` potrafi zglaszac wyscigi
  // kompilacji trybu deweloperskiego, ktore wygladaja w Sentry jak awarie.
  // Uwaga: dot notation jest tu wymagana — webpack podstawia wartosc tylko
  // pod `process.env.NODE_ENV`, zapis nawiasowy zostalby w kodzie klienta.
  enabled: process.env.NODE_ENV === 'production',
})
