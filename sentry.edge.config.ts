import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://d506e3535bcc685bacef3194935d9afc@o4511235084910592.ingest.de.sentry.io/4511235131965520',

  tracesSampleRate: 0.1,
})
