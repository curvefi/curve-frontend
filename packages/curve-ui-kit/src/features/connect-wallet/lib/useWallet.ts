import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { useAccount, useConnect, useConnectorClient, useDisconnect, useEnsName } from 'wagmi'
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

export const createWallet = ({
  chainId,
  provider,
  address,
  ensName,
}: {
  chainId: number
  provider?: Eip1193Provider
  address: Address
  ensName?: string | null
}): Wallet => ({
  provider,
  account: { address, ...(ensName && { ensName }) },
  chainId,
})

const useWallet = () => {
  // Dunno why but it was a global and needs to be a global. Can this be a ref?
  const [showModal, setShowModal] = useGlobalState<boolean>('showConnectModal', false)
  const closeModal = useCallback(() => setShowModal(false), [setShowModal])

  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: client } = useConnectorClient()

  const wallet =
    useMemo(
      () =>
        client?.transport?.request &&
        createWallet({
          chainId: client.chain.id,
          provider: { request: client.transport.request },
          address: client.account.address,
          ensName,
        }),
      [client, ensName],
    ) ?? null

  // important: use the async functions so we can properly handle the promise failures
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  /**
   * Disconnects the wallet from the application.
   *
   * This function performs the following steps:
   * 1. Marks the wallet as manually disconnecting to prevent reconnection attempts
   * 2. Calls disconnectAsync twice to ensure the useAccount hooks properly reset
   *    Bro I don't even know why, but if you call it once the useAccount states won't update...
   */
  const disconnect = async () => {
    await disconnectAsync()
    await disconnectAsync()
  }

  const connectWagmi = useCallback(
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

  const { provider: browserProvider } = useMemo(() => {
    state.wallet = wallet
    state.provider = state.wallet?.provider ? new BrowserProvider(state.wallet.provider) : null
    return state
  }, [wallet])

  return {
    wallet,
    connect: connectWagmi,
    disconnect,
    provider: browserProvider,
    showModal,
    closeModal,
  }
}
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })

export { useWallet }
