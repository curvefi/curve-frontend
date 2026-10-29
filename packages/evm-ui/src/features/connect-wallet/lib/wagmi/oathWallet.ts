import type * as AppKitControllers from '@reown/appkit-controllers'
import oathLogo from '@ui/images/oath-wallet.svg'
import type { Connector } from '@wagmi/core'

export const OATH_WALLET_ID = 'oath-wallet'

// A local iOS wallet entry, not an injected provider or WalletGuide listing ID.
export const OATH_WALLET = {
  id: OATH_WALLET_ID,
  name: 'Oath Wallet',
  homepage: 'https://oathwallet.org',
  image_url: oathLogo,
  mobile_link: 'oathwallet://',
  app_store: 'https://apps.apple.com/app/id6780187283',
}

export type WalletChoice = Pick<Connector, 'id' | 'name' | 'icon'> & { connector: Connector }

export const getWalletChoices = (connectors: Connector[]): WalletChoice[] =>
  connectors.flatMap(connector => {
    const choice = { id: connector.id, name: connector.name, icon: connector.icon, connector }
    return connector.id === 'walletConnect'
      ? [{ id: OATH_WALLET_ID, name: OATH_WALLET.name, icon: OATH_WALLET.image_url, connector }, choice]
      : [choice]
  })

type Controllers = Pick<typeof AppKitControllers, 'ModalController' | 'ConnectionController' | 'RouterController'>

export function presentOathWallet({
  ModalController,
  ConnectionController,
  RouterController,
}: Controllers): () => void {
  ConnectionController.resetUri()
  function showOath() {
    if (ModalController.state.open) {
      RouterController.reset('ConnectingWalletConnect', { wallet: OATH_WALLET })
    }
  }
  const subscriptions = [
    ModalController.subscribeKey('open', open => {
      if (open) showOath()
    }),
    RouterController.subscribeKey('view', view => {
      if (view === 'ConnectingWalletConnectBasic') showOath()
    }),
  ]
  return function dispose() {
    for (const unsubscribe of subscriptions) unsubscribe()
    ConnectionController.resetUri()
    RouterController.reset('Connect')
  }
}

export async function connectOathWallet<T>(
  connector: Connector,
  disconnect: () => Promise<unknown>,
  connect: () => Promise<T>,
): Promise<T> {
  // An explicit Oath selection must not reuse another wallet's active session.
  // Clear Wagmi's connected wallets first, then any provider-only restored session.
  await disconnect()
  const provider = await connector.getProvider()
  if (provider && typeof provider === 'object' && 'session' in provider && provider.session) {
    await connector.disconnect()
  }
  // Same singleton version as EthereumProvider 2.26.0's AppKit dependency.
  const dispose = presentOathWallet(await import('@reown/appkit-controllers'))
  try {
    return await connect()
  } finally {
    dispose()
  }
}
