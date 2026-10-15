import { type ErrorEvent, type Event, type Extras, type Integration, isObjectLike } from '@sentry/core'
import {
  addBreadcrumb as addSentryBreadcrumb,
  type BrowserOptions,
  captureException,
  captureMessage,
  getClient,
  getCurrentScope,
  init,
  setTag,
  setUser as setSentryUser,
  thirdPartyErrorFilterIntegration,
  withScope,
} from '@sentry/react'
import { isModuleLoadError, isUnsupportedChainError } from '@ui/features/errors/errors.util'
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
      isUserErrorReport(event) || (!event.tags?.third_party_code && !isExpectedExternalError(event, error))
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
  'User rejected',
  'User denied',
  'SwitchChainNotSupportedError',
  'not found rainbowkit',
  'Object Not Found Matching Id:',
  "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
]

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

/** Reporting policy for recognized operational failures; codes alone do not identify a wallet. */
const isExpectedExternalError = (event: ErrorEvent, error: unknown) => {
  const code = getErrorCode(error)
  const message = getErrorMessage(event, error)
  const exception = event.exception?.values?.at(-1)
  const type = isObjectLike(error) && typeof error.name === 'string' ? error.name : exception?.type
  const mutationKey = event.extra?.mutationKey
  const isWalletOperation =
    Array.isArray(mutationKey) &&
    typeof mutationKey[0] === 'string' &&
    ['connect', 'reconnect', 'switchChain'].includes(mutationKey[0])

  return (
    isUnsupportedChainError(error) ||
    type === 'SwitchChainNotSupportedError' ||
    (type === 'SwitchChainError' &&
      Boolean(event.exception?.values?.some(e => isUnsupportedChainError({ name: e.type, message: e.value })))) ||
    (isWalletOperation && isModuleLoadError(error ?? { message })) ||
    (typeof message === 'string' &&
      (EXPECTED_EXTERNAL_MESSAGES.some(pattern => message.includes(pattern)) ||
        IGNORED_EXTENSION_MESSAGES.includes(message) ||
        (code === 4001 && REJECTED_WALLET_MESSAGES.includes(message)) ||
        (code === -32601 && (message === 'Method not found' || OPTIONAL_WALLET_METHOD_ERRORS.includes(message))) ||
        (code === -32603 && ['Internal JSON-RPC error.', 'Relay service: ClientOffline'].includes(message)) ||
        (code === 3 && /^execution reverted(?::.*)?$/.test(message)) ||
        ((code === 4100 || type === 'UnauthorizedProviderError') &&
          ['[Filtered]', 'The requested account and/or method has not been authorized by the user.'].includes(
            message,
          )) ||
        ((code === 4900 || type === 'ProviderDisconnectedError') &&
          [
            'The provider is disconnected from all chains.',
            'Message channel disconnected',
            'The Provider is disconnected from all chains.',
          ].includes(message)) ||
        ((code === 4901 || type === 'ChainDisconnectedError') &&
          message === 'The Provider is not connected to the requested chain.')))
  )
}

const getErrorCode = (error: unknown) =>
  isObjectLike(error) && typeof error.code === 'number' ? error.code : undefined

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
  const client = getClient()
  if (!client) throw new Error('Error reporting is unavailable. Please refresh the page and try again.')
  const scope = getCurrentScope().clone()
  const event =
    error == null || typeof error === 'string'
      ? { message: error ?? 'Error Report' }
      : await client.eventFromException(error)

  return client.captureEvent(
    { ...withErrorMessage(event, error), extra: { ...event.extra, body, userReport: true } },
    {},
    scope,
  )
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
