import { type ReactElement } from 'react'
import { zeroAddress } from 'viem'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveContext } from '@evm-ui/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@evm-ui/features/connect-wallet/lib/types'
import { useWallet } from '@evm-ui/features/connect-wallet/lib/useWallet'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'
import { ComponentTestWrapper } from './ComponentTestWrapper'
import { mockedWagmiConfig } from './llamalend/test-wagmi.helpers'

const WalletStateSync = () => {
  // Some DAO stores read the wallet provider outside React.
  useWallet()
  return null
}

export const CurveComponentTestWrapper = ({
  children,
  curve,
  connected = true,
}: {
  children: ReactElement
  curve: CurveApi
  connected?: boolean
}) => (
  <ComponentTestWrapper config={mockedWagmiConfig} autoConnect={connected}>
    <CurveContext
      value={{
        connectState: ConnectState.SUCCESS,
        curveApi: curve,
        isHydrated: true,
        isInitialized: true,
        wallet: connected
          ? { provider: { request: () => Promise.resolve(undefined) }, address: curve.signerAddress ?? zeroAddress }
          : undefined,
        provider: {} as never,
      }}
    >
      <WalletStateSync />
      <FormPlacementProvider placement="inline">{children}</FormPlacementProvider>
    </CurveContext>
  </ComponentTestWrapper>
)
