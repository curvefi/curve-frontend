import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Event } from '@sentry/core'
import { BrowserClient, defaultStackParser, eventFiltersIntegration, init } from '@sentry/react'
import { initSentry } from './sentry'

vi.mock('@ui/lib/env', () => ({ IS_CYPRESS: true, IS_PREVIEW_HOST: false }))
vi.mock('@sentry/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@sentry/react')>()),
  init: vi.fn(),
}))

const GENERIC_MESSAGE = 'Object captured as promise rejection with keys: code, message'
const DISCONNECTED = { code: 4900, message: 'The provider is disconnected from all chains.' }
const WALLET_STACK =
  'Error: The provider is disconnected from all chains.\n at o (chrome-extension://acmacodkjbdgmoleebolmdjonilkdbch/background.js:4:8122317)'

const capture = async (originalException: unknown, overrides: Event = {}) => {
  initSentry('curve-frontend')
  const options = vi.mocked(init).mock.calls[0][0]
  const send = vi.fn(() => Promise.resolve({ statusCode: 200 }))
  const sentEvent = vi.fn<(event: Event) => void>()
  const client = new BrowserClient({
    ...options,
    integrations: [eventFiltersIntegration()],
    stackParser: defaultStackParser,
    transport: () => ({ send, flush: () => Promise.resolve(true) }),
  })
  client.on('beforeSendEvent', sentEvent)
  client.init()
  const value =
    originalException instanceof Error
      ? originalException.message
      : typeof originalException === 'string'
        ? `Non-Error promise rejection captured with value: ${originalException}`
        : GENERIC_MESSAGE
  client.captureEvent(
    { exception: { values: [{ type: 'UnhandledRejection', value }] }, ...overrides },
    { originalException },
  )
  await client.close()
  return { send, event: sentEvent.mock.calls[0]?.[0] }
}

afterEach(() => vi.clearAllMocks())

describe('Sentry events', () => {
  it.each([
    { ...DISCONNECTED },
    { ...DISCONNECTED, stack: WALLET_STACK },
    { code: 4001, message: 'Not Allowed' },
    { code: 4001, message: 'wallet must has at least one account' },
    { code: 4001, message: 'User rejected the request.' },
    { code: 4001, message: 'Permission denied, approve www.curve.finance in Frame to continue' },
    { code: 4001, message: 'Tx Signature: User denied transaction signature.' },
    Object.assign(new Error('Request rejected'), { code: 4001 }),
  ])('filters wallet error $code: $message', async error => {
    const { send } = await capture(error)
    expect(send).not.toHaveBeenCalled()
  })

  it.each([
    'Could not establish connection. Receiving end does not exist.',
    'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received',
    'Extension context invalidated.',
  ])('filters extension messaging across Sentry capture formats: %s', async message => {
    for (const error of [message, new Error(message), { code: -32603, message }]) {
      const { send } = await capture(error)
      expect(send).not.toHaveBeenCalled()
    }
    const { send } = await capture(undefined, { exception: { values: [{ type: 'Error', value: message }] } })
    expect(send).not.toHaveBeenCalled()
  })

  it.each([
    { code: -32601, message: 'the method wallet_revokePermissions does not exist/is not available' },
    { code: -32601, message: "method [rabby:getProviderConfig] doesn't has corresponding handler" },
    { code: -32601, message: "method [wallet_registerOnboarding] doesn't has corresponding handler" },
    { code: -32000, message: 'Failed to fetch' },
  ])('filters known optional wallet methods and provider fetch noise: %j', async error => {
    const { send } = await capture(error)
    expect(send).not.toHaveBeenCalled()
  })

  it.each([
    { code: 4001, message: 'this request method is not supported' },
    { code: 4001, message: 'Unexpected wallet failure' },
    { code: -32601, message: 'Method not found' },
    { code: -32601, message: 'the method eth_sendTransaction does not exist/is not available' },
    { code: -32603, message: 'Internal JSON-RPC error.' },
    { code: -32603, message: "Cannot read properties of undefined (reading 'sendMessage')" },
    { code: -32603, message: 'Relay service: ClientOffline' },
    { code: 3, message: 'execution reverted' },
    { code: 3, message: 'execution reverted: Reserves too small' },
    { code: 4100, message: '[Filtered]' },
    { code: -32603, message: 'Failed to fetch' },
    { code: -32603, message: 'the method wallet_revokePermissions does not exist/is not available' },
    { message: 'Could not establish connection. Receiving end does not exist. Application failed.' },
    { message: 'Application failed', cause: DISCONNECTED },
  ])('retains application failures and errors without a precise noise match: %j', async error => {
    const { send, event } = await capture(error)
    expect(send).toHaveBeenCalledOnce()
    expect(event?.exception?.values?.[0]?.value).toBe(error.message)
  })

  it('retains unsupported chain-switch failures captured by the mutation cache', async () => {
    const error = Object.assign(new Error('An error occurred when attempting to switch chain.'), {
      name: 'SwitchChainError',
      code: 4902,
      cause: {
        name: 'Provider.UnsupportedMethodError',
        message: 'wallet_switchEthereumChain::chainId 0x3e7 not supported',
      },
    })
    const { send } = await capture(error, { extra: { mutationKey: ['switchChain'], variables: { chainId: 999 } } })
    expect(send).toHaveBeenCalledOnce()
  })

  it('retains application errors with an extension error as a nested cause', async () => {
    const exception = {
      values: [
        { type: 'Error', value: 'Extension context invalidated.' },
        { type: 'Error', value: 'Application failed to recover the wallet connection' },
      ],
    }
    const { send, event } = await capture(undefined, { exception })
    expect(send).toHaveBeenCalledOnce()
    expect(event?.exception).toEqual(exception)
  })

  it.each([
    'Object Not Found Matching Id:1, MethodName:update, ParamCount:4',
    'Object Not Found Matching Id:42, MethodName:dispose, ParamCount:0',
  ])('filters CefSharp failures: %s', async message => {
    const { send } = await capture(message)
    expect(send).not.toHaveBeenCalled()
  })

  it.each([{ code: -32603, message: 'Unexpected RPC failure' }, { message: 'Failed to load pool' }])(
    'uses the message of retained object errors: %j',
    async error => {
      const { send, event } = await capture(error)
      expect(send).toHaveBeenCalledOnce()
      expect(event?.exception?.values).toEqual([{ type: 'UnhandledRejection', value: error.message }])
    },
  )

  it.each([undefined, { code: -32603 }, { message: '' }])(
    'keeps the generic message when no original message is available: %j',
    async error => {
      const { send, event } = await capture(error)
      expect(send).toHaveBeenCalledOnce()
      expect(event?.exception?.values).toEqual([{ type: 'UnhandledRejection', value: GENERIC_MESSAGE }])
    },
  )

  it('preserves the stack, mechanism, breadcrumbs and serialized error when replacing the message', async () => {
    const error = { code: -32603, message: 'Unexpected RPC failure', stack: 'Error: Unexpected RPC failure' }
    const stacktrace = { frames: [{ filename: 'https://www.curve.finance/app.js', lineno: 42 }] }
    const mechanism = { type: 'auto.browser.global_handlers.onunhandledrejection', handled: false }
    const breadcrumbs = [{ category: 'navigation', message: 'Opened pool' }]
    const extra = { __serialized__: error }
    const { event } = await capture(error, {
      exception: { values: [{ type: 'UnhandledRejection', value: GENERIC_MESSAGE, stacktrace, mechanism }] },
      breadcrumbs,
      extra,
    })
    expect(event?.exception?.values).toEqual([
      { type: 'UnhandledRejection', value: error.message, stacktrace, mechanism },
    ])
    expect(event?.breadcrumbs).toEqual(breadcrumbs)
    expect(event?.extra).toEqual(extra)
  })

  it('retains IndexedDB failures without evidence that they are extension errors', async () => {
    const exception = {
      values: [{ type: 'Error', value: 'UnknownError: Internal error opening backing store for indexedDB.open.' }],
    }
    const { send, event } = await capture(new Error(exception.values[0].value), { exception })
    expect(send).toHaveBeenCalledOnce()
    expect(event?.exception).toEqual(exception)
  })

  it.each([
    { ...DISCONNECTED },
    { code: 4001, message: 'wallet must has at least one account' },
    { code: -32601, message: 'the method wallet_revokePermissions does not exist/is not available' },
    { code: -32000, message: 'Failed to fetch' },
    new Error('Could not establish connection. Receiving end does not exist.'),
    { code: -32603, message: 'Extension context invalidated.' },
  ])('preserves explicit user reports of otherwise ignored errors: %j', async error => {
    const { send } = await capture(error, { extra: { userReport: true }, tags: { third_party_code: true } })
    expect(send).toHaveBeenCalledOnce()
  })

  it('filters events tagged as third-party code', async () => {
    const { send } = await capture(undefined, { tags: { third_party_code: true } })
    expect(send).not.toHaveBeenCalled()
  })
})
