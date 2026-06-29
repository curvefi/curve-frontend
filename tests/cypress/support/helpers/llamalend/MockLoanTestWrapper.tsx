import { MarketContextProvider } from 'main/src/llamalend/features/market-context/MarketContextProvider'
import { type ReactElement } from 'react'
import { getMarketType } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import { CurveContext } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@ui-kit/features/connect-wallet/lib/types'
import { useWallet } from '@ui-kit/features/connect-wallet/lib/useWallet'
import { constQ } from '@ui-kit/types/util'
import { ComponentTestWrapper } from '../ComponentTestWrapper'
import { createMockLlamaApi, TEST_ADDRESS } from './mock-loan-test-data'
import { llamaNetworks } from './test-context.helpers'
import { mockedWagmiConfig } from './test-wagmi.helpers'

type MockLoanTestWrapperProps = {
  children: ReactElement
  llamaApi: ReturnType<typeof createMockLlamaApi>
  market: LlamaMarketTemplate
}

/**
 * Runs `useWallet()` once so the module-level wallet state is hydrated in tests.
 * Some query validators read `useWallet.getState().provider` directly.
 */
const WalletStateSync = () => {
  useWallet()
  return null
}

export const MockLoanTestWrapper = ({ children, llamaApi, market }: MockLoanTestWrapperProps) => (
  <ComponentTestWrapper config={mockedWagmiConfig}>
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
      <Box sx={{ maxWidth: 520 }}>
        <MarketContextProvider
          network={llamaNetworks[llamaApi.chainId as LlamaChainId]}
          marketQuery={constQ(market)}
          apiMarket={constQ(undefined)}
          marketType={getMarketType(market)}
        >
          {children}
        </MarketContextProvider>
      </Box>
    </CurveContext>
  </ComponentTestWrapper>
)
