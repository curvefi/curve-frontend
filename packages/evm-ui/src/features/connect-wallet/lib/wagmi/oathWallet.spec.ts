import { mainnet } from 'viem/chains'
import { afterEach, describe, expect, it } from 'vitest'
import { mock } from 'wagmi/connectors'
import { ConnectionController, CoreHelperUtil, ModalController, RouterController } from '@reown/appkit-controllers'
import { connect, createConfig, createConnector, createStorage, disconnect, http, noopStorage } from '@wagmi/core'
import { connectOathWallet, getWalletChoices, OATH_WALLET, presentOathWallet } from './oathWallet'

const controllers = { ConnectionController, ModalController, RouterController }
const tick = () => new Promise(resolve => setTimeout(resolve, 0))
const ACCOUNT = '0x0000000000000000000000000000000000000001' as const

function createTestConfig(reject = false, restored = false) {
  const events = { entries: [] as string[] }
  const record = (event: string) => {
    events.entries = [...events.entries, event]
  }
  const provider = { session: restored ? { topic: 'synthetic-session' } : (undefined as object | undefined) }
  const config = createConfig({
    chains: [mainnet],
    transports: { 1: http() },
    storage: createStorage({ storage: noopStorage }),
    multiInjectedProviderDiscovery: false,
    connectors: [
      createConnector(connectorConfig => {
        const delegate = mock({ accounts: [ACCOUNT] })(connectorConfig)
        return {
          ...delegate,
          id: 'walletConnect',
          name: 'WalletConnect',
          type: 'walletConnect',
          async connect<withCapabilities extends boolean = false>(parameters?: {
            withCapabilities?: withCapabilities | boolean
          }) {
            record('connect')
            expect(provider.session).toBeUndefined()
            ModalController.state.open = true
            await tick()
            expect(RouterController.state.data?.wallet).toEqual(OATH_WALLET)
            if (reject) throw new Error('User rejected connection')
            return delegate.connect<withCapabilities>(parameters)
          },
          async disconnect() {
            record('disconnect')
            await delegate.disconnect()
            provider.session = undefined
          },
          getProvider: () => Promise.resolve(provider),
          getAccounts: () => Promise.resolve([ACCOUNT]),
          getChainId: () => Promise.resolve(1),
        }
      }),
    ],
  })
  return { config, connector: config.connectors[0], events, record }
}

afterEach(() => {
  ModalController.state.open = false
  RouterController.reset('Connect')
  ConnectionController.resetUri()
})

describe('Oath Wallet choice', () => {
  it('adds a named row while retaining the canonical connector and generic option', () => {
    const { connector } = createTestConfig()
    const choices = getWalletChoices([connector])
    expect(choices.map(({ id }) => id)).toEqual(['oath-wallet', 'walletConnect'])
    expect(choices[0].connector).toBe(connector)
    expect(choices[1].connector).toBe(connector)
    expect(choices[0].icon).toBe(OATH_WALLET.image_url)
    expect(connector.id).toBe('walletConnect')
    expect(getWalletChoices([])).toEqual([])
    const other = { ...connector, id: 'injected', name: 'Browser wallet' }
    expect(getWalletChoices([other])).toEqual([
      { id: 'injected', name: 'Browser wallet', icon: undefined, connector: other },
    ])
  })

  it('uses actual SDK controllers for the named QR view and removes its subscriptions afterward', async () => {
    const dispose = presentOathWallet(controllers)
    try {
      ModalController.state.open = true
      await tick()
      expect(RouterController.state.view).toBe('ConnectingWalletConnect')
      expect(RouterController.state.data?.wallet).toEqual(OATH_WALLET)
      RouterController.reset('ConnectingWalletConnectBasic')
      await tick()
      expect(RouterController.state.view).toBe('ConnectingWalletConnect')
    } finally {
      dispose()
    }
    expect(RouterController.state.view).toBe('Connect')
    ModalController.state.open = false
    await tick()
    ModalController.state.open = true
    RouterController.reset('ConnectingWalletConnectBasic')
    await tick()
    expect(RouterController.state.view).toBe('ConnectingWalletConnectBasic')
  })

  it('encodes the complete pairing URI in the native iOS link', () => {
    const pairing = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}&expiryTimestamp=2000000000`
    const { redirect } = CoreHelperUtil.formatNativeUrl(OATH_WALLET.mobile_link, pairing)
    const url = new URL(redirect)
    expect(url.protocol).toBe('oathwallet:')
    expect(url.hostname).toBe('wc')
    expect(url.searchParams.get('uri')).toBe(pairing)
    expect([...url.searchParams]).toHaveLength(1)
  })

  it.each([false, true])('pairs using the real Wagmi identity and cleans up on rejection=%s', async reject => {
    const { config, connector, events, record } = createTestConfig(reject, true)
    const result = connectOathWallet(
      connector,
      () => {
        record('clear-active')
        return Promise.resolve()
      },
      () => connect(config, { connector }),
    )
    if (reject) await expect(result).rejects.toThrow('User rejected connection')
    else {
      expect((await result).accounts).toEqual([ACCOUNT])
      expect(config.state.connections.get(config.state.current ?? '')?.connector.id).toBe('walletConnect')
      await disconnect(config, { connector })
    }
    expect(events.entries.slice(0, 3)).toEqual(['clear-active', 'disconnect', 'connect'])
    expect(RouterController.state.view).toBe('Connect')
    RouterController.reset('ConnectingWalletConnectBasic')
    await tick()
    expect(RouterController.state.view).toBe('ConnectingWalletConnectBasic')
  })

  it('does not disconnect a provider without a restored session', async () => {
    const { config, connector, events } = createTestConfig()
    await connectOathWallet(
      connector,
      () => Promise.resolve(),
      () => connect(config, { connector }),
    )
    expect(events.entries).toEqual(['connect'])
    await disconnect(config, { connector })
  })

  it('does not start pairing when clearing the old connection fails', async () => {
    const { connector, events, record } = createTestConfig()
    await expect(
      connectOathWallet(
        connector,
        () => Promise.reject(new Error('Disconnect failed')),
        () => {
          record('unexpected')
          return Promise.resolve()
        },
      ),
    ).rejects.toThrow('Disconnect failed')
    expect(events.entries).toEqual([])
  })
})
