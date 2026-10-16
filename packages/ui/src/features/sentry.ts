import { assert } from '@primitives/objects.utils'
import { type Event, type Extras, type Integration, isObjectLike } from '@sentry/core'
import {
  addBreadcrumb as addSentryBreadcrumb,
  type BrowserOptions,
  getClient,
  getCurrentScope,
  init,
  setTag,
  setUser as setSentryUser,
  thirdPartyErrorFilterIntegration,
} from '@sentry/react'
import { IS_CYPRESS, IS_PREVIEW_HOST } from '@ui/lib/env'

export const SENTRY_DSN =
  'https://946ac1b5b974fb993626876dd310b0d2@o4510753779220480.ingest.de.sentry.io/4510753786101840'
const TLD = 'curve.finance'
const ENVIRONMENT = IS_CYPRESS
  ? 'cypress'
  : IS_PREVIEW_HOST
    ? 'preview'
    : window.location.hostname === `www.${TLD}`
      ? 'production'
      : window.location.hostname.replace(`.${TLD}`, '') // subdomain or hostname, e.g. localhost

/** Initialize Sentry error reporting */
export const initSentry = (applicationKey: string, transport?: BrowserOptions['transport']) =>
  ENVIRONMENT !== 'localhost' &&
  init({
    dsn: SENTRY_DSN,
    ...(transport && { transport }),
    environment: ENVIRONMENT,
    integrations: integrations => [
      ...integrations.filter(i => i.name !== 'BrowserSession').map(preserveUserReports), // we don't use session tracking
      thirdPartyErrorFilterIntegration({
        filterKeys: [applicationKey],
        behaviour: 'apply-tag-if-exclusively-contains-third-party-frames',
      }),
    ],
    beforeSend: (event, { originalException: error }) =>
      isUserErrorReport(event) ||
      (!event.tags?.third_party_code && !isExpectedExternalError(getErrorMessage(event, error)))
        ? withErrorMessage(event, error)
        : null,
    sendClientReports: false, // prevents client_report envelopes for dropped events
    tracesSampleRate: 0.01, // Performance monitoring sample rate (adjust based on traffic)
  })

const isUserErrorReport = (event: Event) => event.extra?.userReport === true

/** Keep SDK defaults for automatic events, but never filter or deduplicate an explicit report. */
const preserveUserReports = (integration: Integration): Integration =>
  integration.processEvent && ['EventFilters', 'Dedupe'].includes(integration.name)
    ? {
        ...integration,
        processEvent: (event, hint, client) =>
          isUserErrorReport(event) ? event : integration.processEvent!(event, hint, client),
      }
    : integration

// Application rules belong here rather than ignoreErrors, which runs before the manual-report bypass.
const EXPECTED_EXTERNAL_MESSAGES = [
  'Network request failed',
  'Failed to fetch',
  'Load failed',
  'AbortError',
  'Object Not Found Matching Id:',
  "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
]

const IGNORED_EXTENSION_MESSAGES = [
  'Could not establish connection. Receiving end does not exist.',
  'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received',
  'Extension context invalidated.',
]

/** Wallet and transaction failures are handled at their call sites; report any that still escape. */
const isExpectedExternalError = (message: string | undefined) =>
  !!message &&
  (EXPECTED_EXTERNAL_MESSAGES.some(pattern => message.includes(pattern)) ||
    IGNORED_EXTENSION_MESSAGES.includes(message))

/** Prefer the original message; Sentry places the outer error after its causes. */
const getErrorMessage = (event: Event, error: unknown) =>
  typeof error === 'string'
    ? error
    : isObjectLike(error) && typeof error.message === 'string'
      ? error.message
      : event.exception?.values?.at(-1)?.value

/**
 * Some wallets reject with plain objects, so Sentry titles unrelated failures "Object captured as ...".
 * Using the actual message lets us distinguish failures without opening each event's serialized data.
 */
const withErrorMessage = <T extends Event>(event: T, error: unknown) => {
  const exception = event.exception?.values?.at(-1)
  const message = getErrorMessage(event, error)
  if (exception?.value?.startsWith('Object captured as ') && message) exception.value = message
  return event
}

/** Build a new event so an earlier automatic capture cannot mark this report as already captured. */
export const captureUserReport = async (error: unknown, body: Extras) => {
  const client = assert(getClient(), 'Error reporting is unavailable. Please refresh the page and try again.')
  const scope = getCurrentScope().clone()
  const event =
    error == null || typeof error === 'string'
      ? { message: error ?? 'Error Report' }
      : await client.eventFromException(error)

  console.info(`Submitting error report:`, body)
  return client.captureEvent(
    { ...withErrorMessage(event, error), extra: { ...event.extra, body, userReport: true } },
    {},
    scope,
  )
}

/**
 * Set user context for error reports.
 */
export function setUser(user: { address?: string; chainId?: number }) {
  setSentryUser(user.address ? { id: user.address } : null)
  if (user.chainId) {
    setTag('chainId', user.chainId)
  }
}

/**
 * Add breadcrumb for debugging.
 */
export const addBreadcrumb = (message: string, category: 'mutation' | 'navigation', data?: Record<string, unknown>) => {
  addSentryBreadcrumb({ message, category, data, level: 'info' })
}
