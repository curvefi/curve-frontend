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
    beforeSend: (event, hint) =>
      isUserErrorReport(event) || (!event.tags?.third_party_code && !isIgnoredWalletError(hint.originalException))
        ? withErrorMessage(event, hint.originalException)
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

/** EIP-1193: user rejection (4001) and provider disconnected from all chains (4900). */
const isIgnoredWalletError = (error: unknown) => isObjectLike(error) && (error.code === 4001 || error.code === 4900)

/**
 * Wallets can throw invalid errors that arrive as "UnhandledRejection: Object captured as promise rejection with keys: ..."
 * This function updates the display message so we can see the error's message in Sentry.
 */
const withErrorMessage = (event: ErrorEvent, error: unknown) => {
  const exception = event.exception?.values?.[0]
  const message = isObjectLike(error) && error.message
  if (exception?.value?.startsWith('Object captured as ') && typeof message === 'string' && message) {
    exception.value = message
  }
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
