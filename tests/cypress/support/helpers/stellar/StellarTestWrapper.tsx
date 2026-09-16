import { noop } from 'lodash'
import type { ReactNode } from 'react'
import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { WalletContext } from '@/stellar/features/connect-wallet/useWallet'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'

export const StellarTestWrapper = ({ children, address }: { children: ReactNode; address?: StellarAddress }) => (
  <ComponentTestWrapper>
    <WalletContext
      value={{
        address,
        connectors: [],
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve(),
        isConnected: Boolean(address),
        isConnecting: false,
        connectingToId: null,
        error: undefined,
        showModal: false,
        closeModal: noop,
      }}
    >
      <FormPlacementProvider placement="inline">{children}</FormPlacementProvider>
    </WalletContext>
  </ComponentTestWrapper>
)
