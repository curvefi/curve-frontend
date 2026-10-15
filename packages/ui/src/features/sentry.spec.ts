import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Event } from '@sentry/core'
import {
  BrowserClient,
  defaultStackParser,
  eventFiltersIntegration,
  dedupeIntegration,
  getCurrentScope,
  init,
} from '@sentry/react'
import { captureUserReport, initSentry } from './sentry'

vi.mock('@ui/lib/env', () => ({ IS_CYPRESS: true, IS_PREVIEW_HOST: false }))
vi.mock('@sentry/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@sentry/react')>()),
  init: vi.fn(),
}))

const GENERIC_MESSAGE = 'Object captured as promise rejection with keys: code, message'
const DISCONNECTED = { code: 4900, message: 'The provider is disconnected from all chains.' }
const WALLET_STACK =
  'Error: The provider is disconnected from all chains.\n at o (chrome-extension://acmacodkjbdgmoleebolmdjonilkdbch/background.js:4:8122317)'

const createClient = () => {
  initSentry('curve-frontend')
  const options = vi.mocked(init).mock.calls.at(-1)![0]
  const send = vi.fn(() => Promise.resolve({ statusCode: 200 }))
  const sentEvent = vi.fn<(event: Event) => void>()
  const client = new BrowserClient({
    ...options,
    integrations:
      typeof options?.integrations === 'function'
        ? options
            .integrations([eventFiltersIntegration(), dedupeIntegration()])
            .filter(integration => integration.name !== 'ThirdPartyErrorsFilter')
        : [],
    stackParser: defaultStackParser,
    transport: () => ({ send, flush: () => Promise.resolve(true) }),
  })
  client.on('beforeSendEvent', sentEvent)
  client.init()
  getCurrentScope().setClient(client)
  return { client, send, sentEvent }
}

const capture = async (originalException: unknown, overrides: Event = {}) => {
  const { client, send, sentEvent } = createClient()
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

afterEach(() => {
  getCurrentScope().setTag('third_party_code', undefined)
  getCurrentScope().setClient(undefined)
  vi.clearAllMocks()
})

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
    { code: -32601, message: 'the method wallet_revokePermissions does not exist/is not available' },
    { code: -32601, message: "method [rabby:getProviderConfig] doesn't has corresponding handler" },
    { code: -32601, message: "method [wallet_registerOnboarding] doesn't has corresponding handler" },
    { code: -32601, message: 'Method not found' },
    { code: -32603, message: 'Internal JSON-RPC error.' },
    { code: -32603, message: 'Relay service: ClientOffline' },
    { code: 3, message: 'execution reverted' },
    { code: 3, message: 'execution reverted: Reserves too small' },
    { code: 4100, message: '[Filtered]' },
    { code: 4901, message: 'The Provider is not connected to the requested chain.' },
    {
      name: 'UnauthorizedProviderError',
      message: 'The requested account and/or method has not been authorized by the user.',
    },
    { name: 'ProviderDisconnectedError', message: 'The Provider is disconnected from all chains.' },
    { name: 'ChainDisconnectedError', message: 'The Provider is not connected to the requested chain.' },
    new Error('not found rainbowkit'),
  ])('retains wallet and RPC failures that reach Sentry: $message', async error => {
    const { send, event } = await capture(error)
    expect(send).toHaveBeenCalledOnce()
    expect(event?.exception?.values?.at(-1)?.value).toBe(error.message)
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
    { code: -32000, message: 'Failed to fetch' },
    { code: -32603, message: 'Failed to fetch' },
  ])('filters network failures: %j', async error => {
    const { send } = await capture(error)
    expect(send).not.toHaveBeenCalled()
  })

  it.each([
    { code: 4001, message: 'this request method is not supported' },
    { code: 4001, message: 'Unexpected wallet failure' },
    { code: -32601, message: 'the method eth_sendTransaction does not exist/is not available' },
    { code: -32603, message: "Cannot read properties of undefined (reading 'sendMessage')" },
    { code: -32603, message: 'the method wallet_revokePermissions does not exist/is not available' },
    { message: 'Could not establish connection. Receiving end does not exist. Application failed.' },
    { message: 'Application failed', cause: DISCONNECTED },
    { code: 4900, message: 'Unexpected application failure' },
    { code: 4100, message: 'Unknown authorization bug' },
    { message: 'Importing a module script failed.' },
  ])('retains application failures and errors without a precise noise match: %j', async error => {
    const { send, event } = await capture(error)
    expect(send).toHaveBeenCalledOnce()
    expect(event?.exception?.values?.[0]?.value).toBe(error.message)
  })

  it.each([
    Object.assign(new Error('Connector does not support switching chains.'), { name: 'SwitchChainNotSupportedError' }),
    Object.assign(new Error('An error occurred when attempting to switch chain.'), {
      name: 'SwitchChainError',
      code: 4902,
      cause: {
        name: 'Provider.UnsupportedMethodError',
        message: 'wallet_switchEthereumChain::chainId 0x3e7 not supported',
      },
    }),
  ])('retains chain-switch failures that reach Sentry: $name', async error => {
    const { send } = await capture(error)
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

describe('explicit reports through SDK processors', () => {
  it.each([
    new Error('Failed to fetch'),
    new Error('User rejected transaction'),
    new Error('Script error.'), // SDK default EventFilters rule
    new Error('Unexpected application failure'),
    { code: 3, message: 'execution reverted: Reserves too small', data: '0x1234' },
    { code: 4900, message: 'The provider is disconnected from all chains.', stack: WALLET_STACK },
  ])('sends a manual report after the same object was automatically captured: %j', async error => {
    const { client, send, sentEvent } = createClient()
    client.captureException(error)
    await client.flush()
    send.mockClear()
    sentEvent.mockClear()

    getCurrentScope().setTag('third_party_code', true)
    const body = { description: 'Please investigate', originalError: error }
    await captureUserReport(error, body)
    await client.flush()
    expect(send).toHaveBeenCalledOnce()
    const event = sentEvent.mock.calls[0][0]
    expect(event.extra?.userReport).toBe(true)
    expect(event.extra?.body).toMatchObject({ description: body.description })
    expect(event.exception?.values?.at(-1)?.value).toBe(error.message)
    if (error instanceof Error) expect(event.exception?.values?.at(-1)?.stacktrace?.frames?.length).toBeGreaterThan(0)
    await client.close()
  })

  it('keeps automatic deduplication and filtering while bypassing them for reports', async () => {
    const { client, send } = createClient()
    const event = { message: 'Unexpected application failure' }
    client.captureEvent({ message: 'Script error.' })
    client.captureEvent(event)
    client.captureEvent(event)
    await client.flush()
    expect(send).toHaveBeenCalledOnce()
    await captureUserReport(event.message, {})
    await client.flush()
    expect(send).toHaveBeenCalledTimes(2)
    client.captureEvent(event)
    await client.close()
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('retains module-loading errors even with wallet metadata', async () => {
    const error = new TypeError('Importing a module script failed.')
    const { send } = await capture(error, { extra: { mutationKey: ['connect'] } })
    expect(send).toHaveBeenCalledOnce()
  })
})
