import { type BrowserProvider } from 'ethers'
import { useCallback, useEffect } from 'react'
import { useConnect, useDisconnect, useEnsName } from 'wagmi'
import { useConnection } from '@ui-kit/features/connect-wallet'
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
  // modal state needs to be global because every call creates new state
  const [showModal, setShowModal] = useGlobalState<boolean>('showConnectModal', false)
  const closeModal = useCallback(() => setShowModal(false), [setShowModal])
  const { wallet, provider } = useConnection()
  state.wallet = wallet ?? null
  state.provider = provider ?? null

  // use the async functions so we can properly handle the promise failures. We could instead use query state in the future.
  const { connectAsync } = useConnect()
  const { disconnect } = useDisconnect()

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

  const { data: ensName } = useEnsName({ address: wallet?.account.address })
  useEffect(() => {
    // not changing the object reference, so we avoid reinitializing the app
    state.wallet && (state.wallet.account.ensName = ensName ?? undefined)
  }, [ensName])

  return { wallet, connect, disconnect, provider, showModal, closeModal }
}
useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })

export { useWallet }
