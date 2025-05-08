import { BrowserProvider } from 'ethers'
import { useCallback, useEffect, useMemo } from 'react'
import { useConnect, useConnectorClient, useDisconnect, useEnsName } from 'wagmi'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import type { Wallet } from './types'
import { connectors } from './wagmi/connectors'
import { supportedWallets } from './wagmi/wallets'

const state: {
  provider: BrowserProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

const useWallet = () => {
  // Dunno why but it was a global and needs to be a global. Can this be a ref?
  const [showModal, setShowModal] = useGlobalState<boolean>('showConnectModal', false)
  const closeModal = useCallback(() => setShowModal(false), [setShowModal])
  const { data: client } = useConnectorClient()

  const address = client?.account.address
  const { wallet, provider } =
    useMemo(() => {
      const wallet =
        address && client?.transport.request
          ? {
              provider: { request: client.transport.request },
              account: { address }, // the ensName is set later when detected
              chainId: client.chain.id,
            }
          : null
      state.wallet = wallet
      state.provider = wallet ? new BrowserProvider(wallet.provider) : null
      return state
    }, [address, client?.chain.id, client?.transport.request]) ?? null

  // use the async functions so we can properly handle the promise failures. We could instead use query state in the future.
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const disconnect = useCallback(async () => {
    // Call disconnectAsync twice to ensure the useAccount hooks properly reset
    // Bro I don't even know why, but if you call it once the useAccount states won't update...
    await disconnectAsync()
    await disconnectAsync()
  }, [disconnectAsync])

  const connect = useCallback(
    async (connector?: (typeof supportedWallets)[number]['connector']) => {
      if (!connector) {
        setShowModal(true)
        return
      }

      // take the first (injected) as default. This is temporary until we get rid of onboard
      const walletType = supportedWallets.find((w) => w.connector === connector) ?? supportedWallets[0]!
      try {
        await connectAsync({ connector: connectors[walletType.connector] })
        setShowModal(false)
      } catch (err) {
        console.error('Error connecting wallet:', err)
        throw err
      }
    },
    [connectAsync, setShowModal],
  )

  const { data: ensName } = useEnsName({ address })
  useEffect(() => {
    // not changing the object reference, so we avoid reinitializing the app
    state.wallet && (state.wallet.account.ensName = ensName ?? undefined)
  }, [ensName])

  return { wallet, connect, disconnect, provider, showModal, closeModal }
}
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })

export { useWallet }
