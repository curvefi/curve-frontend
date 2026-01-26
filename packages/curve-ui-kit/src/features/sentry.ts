import {
  init,
  withScope,
  captureException,
  captureMessage,
  setUser as setSentryUser,
  setTag,
  addBreadcrumb as addSentryBreadcrumb,
} from '@sentry/react'
import { isDevelopment } from '@ui-kit/utils'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

/**
 * Initialize Sentry error reporting.
 * Only active in production when VITE_SENTRY_DSN is set.
 * No configuration needed for local development.
 */
export function initSentry() {
  if (isDevelopment) return console.warn(`Sentry disabled in DEV mode`)
  init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring sample rate (adjust based on traffic)
    tracesSampleRate: 0.1,

    // Session replay for debugging (only on errors)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

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
}

/**
 * Capture an error manually with optional context.
 */
export const captureError = (error: Error, context?: Record<string, unknown>) =>
  context
    ? withScope((scope) => {
        scope.setExtras(context)
        captureException(error)
      })
    : captureException(error)

/**
 * Capture an error manually with optional context.
 */
export const captureString = (message: string, context?: Record<string, unknown>) =>
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
export function addBreadcrumb(message: string, category: 'mutation' | 'navigation', data?: Record<string, unknown>) {
  addSentryBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}
