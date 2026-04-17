import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://b4c9dea2eb27357004a1a8ddd72b5322@o4511235084910592.ingest.de.sentry.io/4511235088121936',

  // Próbkowanie błędów i transakcji
  tracesSampleRate: 0.1,

  // Replay — nagrywa sesję użytkownika gdy wystąpi błąd
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.01,

  integrations: [Sentry.replayIntegration()],
})
