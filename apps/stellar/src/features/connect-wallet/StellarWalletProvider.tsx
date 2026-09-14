import { type ReactNode, useCallback, useEffect, useState } from 'react'
import type { StellarAddress } from '@/features/connect-wallet/address'
import {
  connectWallet,
  disconnectWallet,
  initWallet,
  onWalletAddressChanged,
  refreshSupportedWallets,
  type WalletConnector,
} from '@/features/connect-wallet/stellar-wallet-kit'
import { useSwitch } from '@ui/hooks/useSwitch'
import { WalletContext } from './useWallet'

const useConnect = ({
  setError,
  openModal,
  closeModal,
}: {
  setError: (error: Error | undefined) => void
  openModal: () => void
  closeModal: () => void
}) => {
  const [connectors, setConnectors] = useState<WalletConnector[]>([])
  const [isLoadingConnectors, startLoadingConnectors, stopLoadingConnectors] = useSwitch(false)
  const [connectingToId, setConnectingToId] = useState<string | null>(null)

  const connect = useCallback(
    (connector?: WalletConnector) => {
      setError(undefined)
      if (!connector) {
        startLoadingConnectors()
        return refreshSupportedWallets()
          .then(setConnectors, setError)
          .finally(() => {
            stopLoadingConnectors()
            openModal()
          })
      }

      setConnectingToId(connector.id)
      return connectWallet(connector)
        .then(closeModal, setError)
        .finally(() => setConnectingToId(null))
    },
    [closeModal, openModal, setError, startLoadingConnectors, stopLoadingConnectors],
  )

  return { connect, connectors, connectingToId, isConnecting: isLoadingConnectors || connectingToId !== null }
}

const useDisconnect = ({
  setError,
  openModal,
  closeModal,
}: {
  setError: (error: Error | undefined) => void
  openModal: () => void
  closeModal: () => void
}) =>
  useCallback(
    () =>
      disconnectWallet().then(
        () => {
          setError(undefined)
          closeModal()
        },
        error => {
          setError(error as Error)
          openModal()
        },
      ),
    [closeModal, openModal, setError],
  )

export const StellarWalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<StellarAddress>()
  const [showModal, openModal, closeModal] = useSwitch(false)
  const [error, setError] = useState<Error>()
  const { connect, connectors, connectingToId, isConnecting } = useConnect({ setError, openModal, closeModal })
  const disconnect = useDisconnect({ setError, openModal, closeModal })

  useEffect(() => initWallet(), [])
  useEffect(() => onWalletAddressChanged(setAddress), [])

  return (
    <WalletContext
      value={{
        address,
        connectors,
        connect,
        disconnect,
        isConnected: Boolean(address),
        isConnecting,
        connectingToId,
        error,
        showModal,
        closeModal,
      }}
    >
      {children}
    </WalletContext>
  )
}
