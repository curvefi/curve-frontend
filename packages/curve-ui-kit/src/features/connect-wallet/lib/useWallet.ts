import { type BrowserProvider } from 'ethers'
import { useCallback } from 'react'
import { useConnect, useConnectors, useDisconnect, type Connector } from 'wagmi'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useGlobalState } from '@ui-kit/hooks/useGlobalState'
import { isCypress } from '@ui-kit/utils'
import type { Wallet } from './types'

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

  // Opens modal when no connector given (clicking 'Connect Wallet' button), otherwise connects directly with the provided connector
  const connect = useCallback(
    async (connector?: Connector) => {
      // When using Cypress, we want to use the one and only (test) connector without blocking modal
      if (!connector && !isCypress) {
        setShowModal(true)
        return
      }

      try {
        await connectAsync({ connector: connector ?? connectors[0] })
        setShowModal(false)
      } catch (err) {
        console.error('Error connecting wallet:', err)
        throw err
      }
    },
    [connectAsync, connectors, setShowModal],
  )

  return { wallet, connectors, connect, disconnect, provider, showModal, closeModal, connectState }
}

useWallet.getState = () => ({ wallet: state.wallet, provider: state.provider })
