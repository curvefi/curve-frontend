import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { useAccount, useConnect, useConnectorClient, useDisconnect, useEnsName } from 'wagmi'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import type { Wallet } from './types'
import { connectors } from './wagmi/connectors'
import { supportedWallets, type WalletType } from './wagmi/wallets'

const state: {
  provider: BrowserProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

export const useWalletType = () => useGlobalState<WalletType, null>('wallet', null)
export const useConnectCallbacks = () =>
  useGlobalState<[resolve: (wallet: Wallet | null) => void, reject: (err: unknown) => void], null>(
    'wagmiConnectCallbacks',
    null,
  )

export const createWallet = ({
  chainId,
  provider,
  label,
  address,
  ensName,
}: {
  chainId: number
  provider?: Eip1193Provider
  label?: string
  address: Address
  ensName?: string | null
}): Wallet => ({
  label,
  provider,
  account: { address, ...(ensName && { ensName }) },
  chainId,
})

const useWallet = () => {
  // when the modal is displayed, we save a promise to resolve later - this is for compatibility with existing code
  const [connectCallbacks, setConnectCallbacks] = useConnectCallbacks()

  // this is the wallet type selected in the modal
  const [walletType, setWalletType] = useWalletType()

  const { data: client } = useConnectorClient()
  const provider = useMemo(() => client?.transport.request && { request: client.transport.request }, [client])

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

  const { address, isConnecting, isReconnecting } = useAccount()

  const connectWagmi = useCallback(
    async (label?: string) => {
      if (!label) {
        return new Promise<Wallet | null>((...args) => setConnectCallbacks(args))
      }

      // take the first (injected) as default. This is temporary until we get rid of onboard
      const walletType = supportedWallets.find((w) => w.label === label) ?? supportedWallets[0]!
      setWalletType(walletType)
      const [resolve, reject] = connectCallbacks ?? []
      try {
        const res = await connectAsync({ connector: connectors[walletType.connector] })

        const {
          accounts: [address],
          chainId,
        } = res

        const wallet = createWallet({
          chainId,
          provider,
          label,
          address,
        })
        resolve?.(wallet)
        return wallet
      } catch (err) {
        console.error('Error connecting wallet:', err)
        reject?.(err)
        throw err
      }
    },
    [setWalletType, connectCallbacks, setConnectCallbacks, connectAsync, provider],
  )

  const { data: ensName } = useEnsName({ address })

  const wallet =
    useMemo(
      () =>
        client &&
        address &&
        createWallet({
          chainId: client.chain.id,
          provider,
          label: walletType?.label,
          address,
          ensName,
        }),
      [address, client, provider, walletType?.label, ensName],
    ) ?? null

  const showModal = !!connectCallbacks
  const closeModal = useCallback(
    () =>
      setConnectCallbacks((callbacks) => {
        callbacks?.[0]?.(null)
        return null
      }),
    [setConnectCallbacks],
  )

  const connecting = (isConnecting || showModal) && !isReconnecting && !address // note: workaround to avoid showing the modal when reconnecting

  const { provider: browserProvider } = useMemo(() => {
    state.wallet = wallet
    state.provider = state.wallet?.provider ? new BrowserProvider(state.wallet.provider) : null
    return state
  }, [wallet])

  return {
    wallet,
    connecting,
    connect: connectWagmi,
    disconnect,
    provider: browserProvider,
    signerAddress: wallet?.account?.address,
    showModal,
    closeModal,
  }
}
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })

export { useWallet }
