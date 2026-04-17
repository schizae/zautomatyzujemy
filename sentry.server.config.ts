import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://b4c9dea2eb27357004a1a8ddd72b5322@o4511235084910592.ingest.de.sentry.io/4511235088121936',

  tracesSampleRate: 0.1,
})
