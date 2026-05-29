import { type ReactElement } from 'react'
import Box from '@mui/material/Box'
import { CurveContext } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@ui-kit/features/connect-wallet/lib/types'
import { useWallet } from '@ui-kit/features/connect-wallet/lib/useWallet'
import { ComponentTestWrapper } from '../ComponentTestWrapper'
import { createMockLlamaApi, TEST_ADDRESS } from './mock-loan-test-data'
import { mockedWagmiConfig } from './test-wagmi.helpers'

interface MockLoanTestWrapperProps {
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
  <ComponentTestWrapper config={mockedWagmiConfig}>
    {/* eslint-disable-next-line @eslint-react/no-context-provider -- Existing violation before enabling this rule. */}
    <CurveContext
      value={{
        connectState: ConnectState.SUCCESS,
        isHydrated: true,
        isInitialized: true,
        llamaApi: llamaApi as never,
        // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
        wallet: { provider: { request: async () => undefined }, address: TEST_ADDRESS },
        provider: {} as never, // Intentionally unused here; gas info is seeded via setGasInfo() in test context.
      }}
    >
      <WalletStateSync />
      <Box sx={{ maxWidth: 520 }}>{children}</Box>
    </CurveContext>
  </ComponentTestWrapper>
)
