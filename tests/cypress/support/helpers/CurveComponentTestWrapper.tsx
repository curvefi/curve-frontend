import { type ReactElement } from 'react'
import { zeroAddress } from 'viem'
import type { CurveApi } from '@/dao/types/dao.types'
import { CurveContext } from '@evm-ui/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@evm-ui/features/connect-wallet/lib/types'
import { useWallet } from '@evm-ui/features/connect-wallet/lib/useWallet'
import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { FormPlacementProvider } from '@evm-ui/widgets/DetailPageLayout/form-context/FormPlacementProvider'
import { ComponentTestWrapper } from './ComponentTestWrapper'
import { mockedWagmiConfig } from './llamalend/test-wagmi.helpers'

const WalletStateSync = () => {
  // Some DAO stores read the wallet provider outside React.
  useWallet()
  return null
}

export const CurveComponentTestWrapper = ({ children, curve }: { children: ReactElement; curve: CurveApi }) => {
  globalLibs.current.curveApi = curve

  return (
    <ComponentTestWrapper config={mockedWagmiConfig} autoConnect>
      <CurveContext
        value={{
          connectState: ConnectState.SUCCESS,
          curveApi: curve,
          isHydrated: true,
          isInitialized: true,
          wallet: {
            provider: { request: () => Promise.resolve(undefined) },
            address: curve.signerAddress ?? zeroAddress,
          },
          provider: {} as never,
        }}
      >
        <WalletStateSync />
        <FormPlacementProvider placement="inline">{children}</FormPlacementProvider>
      </CurveContext>
    </ComponentTestWrapper>
  )
}
