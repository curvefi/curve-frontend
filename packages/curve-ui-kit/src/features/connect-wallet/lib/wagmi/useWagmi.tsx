import type { Eip1193Provider } from 'ethers'
import { useCallback, useMemo, useEffect } from 'react'
import { useAccount, useConnect, useConnectorClient, useDisconnect, useEnsName } from 'wagmi'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import type { Address } from '@ui-kit/utils'
import type { Wallet } from '../types'
import { connectors } from './connectors'
import { supportedWallets, type WalletType } from './wallets'

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

export const useWalletType = () => useGlobalState<WalletType, null>('wallet', null)
export const useConnectCallbacks = () =>
  useGlobalState<[resolve: (wallet: Wallet | null) => void, reject: (err: unknown) => void], null>(
    'wagmiConnectCallbacks',
    null,
  )

export const useWagmi = () => {
  // when the modal is displayed, we save a promise to resolve later - this is for compatibility with existing code
  const [connectCallbacks, setConnectCallbacks] = useConnectCallbacks()

  // this is the wallet type selected in the modal
  const [walletType, setWalletType] = useWalletType()

  const { data: client } = useConnectorClient()
  const provider = useMemo(() => (client ? { request: client.transport.request } : undefined), [client])

  useEffect(() => {
    console.info(`Found new client for address: ${client?.account?.address}`)
  }, [client])

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

  const closeModal = useCallback(
    () =>
      setConnectCallbacks((callbacks) => {
        callbacks?.[0]?.(null)
        return null
      }),
    [setConnectCallbacks],
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
  const connecting = (isConnecting || showModal) && !isReconnecting && !address // note: workaround to avoid showing the modal when reconnecting
  return [{ wallet, connecting, showModal }, connectWagmi, disconnect, closeModal] as const
}
