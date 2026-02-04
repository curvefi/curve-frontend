import {
  addBreadcrumb as addSentryBreadcrumb,
  captureException,
  captureMessage,
  init,
  setTag,
  setUser as setSentryUser,
  withScope,
} from '@sentry/react'

const { SENTRY_DSN, NODE_ENV } = process.env
const dsn = SENTRY_DSN ?? window.SENTRY_DSN

/**
 * Initialize Sentry error reporting. Only active when SENTRY_DSN is set or in E2E tests.
 */
export const initSentry = () =>
  dsn
    ? init({
        dsn,
        environment: NODE_ENV,

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
    : console.warn(`Sentry disabled: no DSN configured`)

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
export const addBreadcrumb = (message: string, category: 'mutation' | 'navigation', data?: Record<string, unknown>) => {
  addSentryBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}
