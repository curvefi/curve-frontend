import { type ErrorEvent, type Event, type Extras, isObjectLike } from '@sentry/core'
import {
  addBreadcrumb as addSentryBreadcrumb,
  captureException,
  captureMessage,
  init,
  setTag,
  setUser as setSentryUser,
  thirdPartyErrorFilterIntegration,
  withScope,
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
      : window.location.hostname.includes(`.${TLD}`)
        ? window.location.hostname.replace(`.${TLD}`, '')
        : window.location.hostname // e.g. localhost

/** Initialize Sentry error reporting */
export const initSentry = (applicationKey: string) =>
  ENVIRONMENT !== 'localhost' &&
  init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: integrations => [
      ...integrations.filter(i => i.name !== 'BrowserSession'), // we don't use session tracking
      thirdPartyErrorFilterIntegration({
        filterKeys: [applicationKey],
        behaviour: 'apply-tag-if-exclusively-contains-third-party-frames',
      }),
    ],
    beforeSend: (event, { originalException: error }) =>
      isUserErrorReport(event) ||
      (!event.tags?.third_party_code && !isIgnoredError(getErrorCode(error), getErrorMessage(event, error)))
        ? withErrorMessage(event, error)
        : null,
    sendClientReports: false, // prevents client_report envelopes for dropped events
    tracesSampleRate: 0.01, // Performance monitoring sample rate (adjust based on traffic)
    // Filter out noise
    ignoreErrors: [
      // Network errors that are expected
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // User-initiated navigation
      'AbortError',
      // Wallet connection issues (often user-initiated)
      'User rejected',
      'User denied',
      'SwitchChainNotSupportedError',
      // Browser wallet extensions may throw internal module errors — not caused by app code
      'not found rainbowkit',
      // CefSharp's embedded browser cannot find a .NET object called from JavaScript.
      'Object Not Found Matching Id:',
      // Browser translation/extension DOM mutations can break React reconciliation
      "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
    ],
  })

const isUserErrorReport = (event: Event) => event.extra?.userReport === true

const IGNORED_EXTENSION_MESSAGES = [
  'Could not establish connection. Receiving end does not exist.',
  'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received',
  'Extension context invalidated.',
]

const REJECTED_WALLET_MESSAGES = [
  'Not Allowed',
  'wallet must has at least one account',
  'Request rejected',
  'User rejected the request.',
  'Permission denied, approve www.curve.finance in Frame to continue',
  'Tx Signature: User denied transaction signature.',
]

const OPTIONAL_WALLET_METHOD_ERRORS = [
  'the method wallet_revokePermissions does not exist/is not available',
  "method [rabby:getProviderConfig] doesn't has corresponding handler",
  "method [wallet_registerOnboarding] doesn't has corresponding handler",
]

/** Match original object messages here: Sentry's ignoreErrors runs before beforeSend. */
const isIgnoredError = (code: number | undefined, message: string | undefined) =>
  code === 4900 ||
  (typeof message === 'string' &&
    (IGNORED_EXTENSION_MESSAGES.includes(message) ||
      (code === 4001 && REJECTED_WALLET_MESSAGES.includes(message)) ||
      (code === -32601 && OPTIONAL_WALLET_METHOD_ERRORS.includes(message)) ||
      (code === -32000 && message === 'Failed to fetch')))

const getErrorCode = (error: unknown) =>
  isObjectLike(error) && typeof error.code === 'number' ? error.code : undefined

/** Prefer the original message; Sentry places the outer error after its causes. */
const getErrorMessage = (event: ErrorEvent, error: unknown) =>
  typeof error === 'string'
    ? error
    : isObjectLike(error) && typeof error.message === 'string'
      ? error.message
      : event.exception?.values?.at(-1)?.value

/**
 * Some wallets reject with plain objects, so Sentry titles unrelated failures "Object captured as ...".
 * Using the actual message lets us distinguish failures without opening each event's serialized data.
 */
const withErrorMessage = (event: ErrorEvent, error: unknown) => {
  const exception = event.exception?.values?.at(-1)
  const message = getErrorMessage(event, error)
  if (exception?.value?.startsWith('Object captured as ') && message) exception.value = message
  return event
}

/**
 * Capture an error manually with optional context.
 */
export const captureError = (error: Error, context?: Extras) =>
  context
    ? withScope(scope => {
        scope.setExtras(context)
        captureException(error)
      })
    : captureException(error)

/**
 * Capture an error manually with optional context.
 */
export const captureString = (message: string, context?: Extras) =>
  context
    ? withScope(scope => {
        scope.setExtras(context)
        captureMessage(message)
      })
    : captureMessage(message)

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
