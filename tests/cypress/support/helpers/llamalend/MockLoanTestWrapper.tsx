import { type ReactElement } from 'react'
import Box from '@mui/material/Box'
import { CurveContext } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@ui-kit/features/connect-wallet/lib/types'
import { ComponentTestWrapper } from '../ComponentTestWrapper'
import { createMockLlamaApi, TEST_ADDRESS } from './mock-loan-test-data'
import { testWagmiConfig } from './test-wagmi.helpers'

type MockLoanTestWrapperProps = {
  children: ReactElement
  llamaApi: ReturnType<typeof createMockLlamaApi>
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
      }}
    >
      <Box sx={{ maxWidth: 520 }}>{children}</Box>
    </CurveContext.Provider>
  </ComponentTestWrapper>
)
