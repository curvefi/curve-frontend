import type { CyHttpMessages } from 'cypress/types/net-stubbing'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { SENTRY_DSN } from '@ui-kit/features/sentry'

const parseEnvelope = (envelope: string) => envelope.split('\n').filter(Boolean) as [string, string, string]

/**
 * When sentry source maps are enabled, Cypress sends client_report envelopes for events that fail to send (e.g. due to network issues)
 */
const isClientReport = ({ body }: CyHttpMessages.IncomingHttpRequest) =>
  JSON.parse(parseEnvelope(body)[1]).type === 'client_report'

const sentryReply = {
  statusCode: 200,
  body: {},
  headers: {
    'access-control-allow-origin': '*',
    'access-control-allow-credentials': 'true',
  },
}

/**
 * Intercept a user-submitted Sentry error report and run assertions on its body.
 * In CI, Sentry flushes client_report envelopes (discarded events from network failures) before the
 * actual user report. The middleware intercept handles those explicitly so they don't pollute the alias.
 * Returns a wait function to be called after the action that triggers the report. */
export const interceptSentryReport = (callback: (body: Record<string, unknown>) => void) => {
  const { origin, pathname } = new URL(SENTRY_DSN)
  const sentryUrl = `${origin}/api/${pathname}/envelope/?**`
  cy.intercept({ method: 'POST', url: sentryUrl, middleware: true }, (req) =>
    isClientReport(req) ? req.reply(sentryReply) : req.continue(),
  )
  cy.intercept('POST', sentryUrl, ({ body: envelope, reply }) => {
    const lines = parseEnvelope(envelope)
    const event = JSON.parse(lines[2]) // event payload is the third line
    callback(event.extra.body)
    reply(sentryReply)
  }).as('sentryReport')
  return () => cy.wait('@sentryReport', LOAD_TIMEOUT)
}
