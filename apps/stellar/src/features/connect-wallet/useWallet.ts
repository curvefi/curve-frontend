import { createContext, use } from 'react'
import type { StellarAddress } from '@/features/connect-wallet/address'
import type { WalletConnector } from '@/features/connect-wallet/stellar-wallet-kit'
import { assert } from '@primitives/objects.utils'

type WalletContextValue = {
  address: StellarAddress | undefined
  connectors: WalletConnector[]
  connect: (connector?: WalletConnector) => Promise<void>
  disconnect: () => Promise<void>
  isConnected: boolean
  isConnecting: boolean
  connectingToId: string | null
  error: Error | undefined
  showModal: boolean
  closeModal: () => void
}

export const WalletContext = createContext<WalletContextValue | null>(null)

export const useWallet = () => assert(use(WalletContext), 'useWallet must be used within StellarWalletProvider')
