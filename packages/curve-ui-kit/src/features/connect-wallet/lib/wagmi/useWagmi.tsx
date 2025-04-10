import { useCallback, useMemo } from 'react'
import type { Chain, Client, Transport } from 'viem'
import { useAccount, useClient, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import type { Address } from '@ui-kit/utils'
import type { Wallet } from '../types'
import { connectors } from './connectors'
import { supportedWallets, type WalletType } from './wallets'

export const createWallet = ({
  client,
  label,
  address,
  ensName,
}: {
  client: Client<Transport, Chain>
  label?: string
  address: Address
  ensName?: string | null
}): Wallet => ({
  label,
  account: { address, ...(ensName && { ensName }) },
  chainId: client.chain.id,
  provider: client.transport,
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

  // important: use the async functions so we can properly handle the promise failures
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const client = useClient()
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
        } = res
        const wallet = createWallet({ client, label, address })
        resolve?.(wallet)
        return wallet
      } catch (err) {
        console.error('Error connecting wallet:', err)
        debugger
        reject?.(err)
        throw err
      }
    },
    [client, connectAsync, connectCallbacks, setConnectCallbacks, setWalletType],
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
      () => address && createWallet({ client, label: walletType?.label, address, ensName }),
      [address, client, walletType, ensName],
    ) ?? null

  const showModal = !!connectCallbacks
  const connecting = (isConnecting || showModal) && !isReconnecting && !address // note: workaround to avoid showing the modal when reconnecting
  return [{ wallet, connecting, showModal }, connectWagmi, disconnectAsync, closeModal] as const
}
