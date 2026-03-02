import { type ReactElement } from 'react'
import Box from '@mui/material/Box'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { CurveContext } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@ui-kit/features/connect-wallet/lib/types'
import { ComponentTestWrapper } from '../ComponentTestWrapper'
import { createMockLlamaApi, TEST_ADDRESS } from './mock-loan-test-data'
import { testWagmiConfig } from './test-wagmi.helpers'

type MockLoanTestWrapperProps = {
  children: ReactElement
  llamaApi: ReturnType<typeof createMockLlamaApi>
}

/**
 * Runs `useWallet()` once so the module-level wallet state is hydrated in tests.
 * Some query validators read `useWallet.getState().provider` directly.
 */
const WalletStateSync = () => {
  useWallet()
  return null
}

export const MockLoanTestWrapper = ({ children, llamaApi }: MockLoanTestWrapperProps) => (
  <ComponentTestWrapper config={testWagmiConfig}>
    <CurveContext.Provider
      value={{
        connectState: ConnectState.SUCCESS,
        isHydrated: true,
        isReconnecting: false,
        llamaApi: llamaApi as never,
        wallet: { provider: { request: async () => undefined }, address: TEST_ADDRESS },
        provider: {} as never, // Intentionally unused here; gas info is seeded via setGasInfo() in test context.
      }}
    >
      <WalletStateSync />
      <Box sx={{ maxWidth: 520 }}>{children}</Box>
    </CurveContext.Provider>
  </ComponentTestWrapper>
)
