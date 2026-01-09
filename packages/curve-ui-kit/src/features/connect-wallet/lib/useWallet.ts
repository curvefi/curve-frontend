import { type BrowserProvider } from 'ethers'
import { useCallback, useEffect } from 'react'
import { useConnect, useConnectors, useDisconnect, useEnsName } from 'wagmi'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import { isCypress } from '@ui-kit/utils'
import type { Wallet } from './types'
import type { Connector } from './wagmi/wallets'

const state: {
  provider: BrowserProvider | null
  wallet: Wallet | null
} = {
  provider: null,
  wallet: null,
}

export const useWallet = () => {
  // modal state needs to be global because every call creates new state
  const [showModal, setShowModal] = useGlobalState<boolean>('showConnectModal', false)
  const closeModal = useCallback(() => setShowModal(false), [setShowModal])
  const { wallet, provider, connectState } = useCurve()
  const connectors = useConnectors()
  // eslint-disable-next-line react-hooks/immutability
  state.wallet = wallet ?? null
  // eslint-disable-next-line react-hooks/immutability
  state.provider = provider ?? null

  // use the async functions so we can properly handle the promise failures. We could instead use query state in the future.
  const { mutateAsync: connectAsync } = useConnect()
  const { mutate: disconnect } = useDisconnect()

  const connect = useCallback(
    async (selectedConnector?: Connector) => {
      // When using Cypress, we want to use the one and only (test) connector without blocking modal
      if (!selectedConnector && !isCypress) {
        setShowModal(true)
        return
      }

      const connector = connectors.find((x) => x.id === selectedConnector) ?? connectors[0]
      try {
        await connectAsync({ connector })
        setShowModal(false)
      } catch (err) {
        console.error('Error connecting wallet:', err)
        throw err
      }
    },
    [connectAsync, connectors, setShowModal],
  )

  const { data: ensName } = useEnsName({ address: wallet?.account.address })
  useEffect(() => {
    // not changing the object reference, so we avoid reinitializing the app
    if (state.wallet) state.wallet.account.ensName = ensName ?? undefined
  }, [ensName])

  return { wallet, connect, disconnect, provider, showModal, closeModal, connectState }
}

useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })
