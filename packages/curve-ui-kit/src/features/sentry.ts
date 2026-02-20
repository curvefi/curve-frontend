import { type Extras } from '@sentry/core'
import {
  addBreadcrumb as addSentryBreadcrumb,
  captureException,
  captureMessage,
  init,
  setTag,
  setUser as setSentryUser,
  withScope,
} from '@sentry/react'
import { isCypress, isPreviewHost } from '@ui-kit/utils/env'

export const SENTRY_DSN =
  'https://946ac1b5b974fb993626876dd310b0d2@o4510753779220480.ingest.de.sentry.io/4510753786101840'

const TLD = 'curve.finance'
const environment = isCypress
  ? 'cypress'
  : isPreviewHost
    ? 'preview'
    : window.location.hostname === `www.${TLD}`
      ? 'production'
      : window.location.hostname.includes(`.${TLD}`)
        ? window.location.hostname.replace(`.${TLD}`, '')
        : window.location.hostname // e.g. localhost

/** Initialize Sentry error reporting */
export const initSentry = () =>
  environment !== 'localhost' &&
  init({
    dsn: SENTRY_DSN,
    environment,
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
    ],
  })

/**
 * Capture an error manually with optional context.
 */
export const captureError = (error: Error, context?: Extras) =>
  context
    ? withScope((scope) => {
        scope.setExtras(context)
        captureException(error)
      })
    : captureException(error)

/**
 * Capture an error manually with optional context.
 */
export const captureString = (message: string, context?: Extras) =>
  context
    ? withScope((scope) => {
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
  addSentryBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}
