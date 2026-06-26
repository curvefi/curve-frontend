import { MarketContextProvider } from 'main/src/llamalend/features/market-context/MarketContextProvider'
import { type ReactElement } from 'react'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import { CurveContext } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@ui-kit/features/connect-wallet/lib/types'
import { useWallet } from '@ui-kit/features/connect-wallet/lib/useWallet'
import type { LlamaMarketType } from '@ui-kit/types/market'
import type { QueryProp } from '@ui-kit/types/util'
import { ComponentTestWrapper } from '../ComponentTestWrapper'
import { createMockLlamaApi, TEST_ADDRESS } from './mock-loan-test-data'
import { mockedWagmiConfig } from './test-wagmi.helpers'

type MockLoanTestWrapperProps = {
  children: ReactElement
  llamaApi: ReturnType<typeof createMockLlamaApi>
  chainId: IChainId
  marketQuery: QueryProp<LlamaMarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
  marketType: LlamaMarketType
}

/**
 * Runs `useWallet()` once so the module-level wallet state is hydrated in tests.
 * Some query validators read `useWallet.getState().provider` directly.
 */
const WalletStateSync = () => {
  useWallet()
  return null
}

export const MockLoanTestWrapper = ({
  children,
  llamaApi,
  chainId,
  marketQuery,
  apiMarket,
  marketType,
}: MockLoanTestWrapperProps) => (
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
          chainId={chainId}
          marketQuery={marketQuery}
          apiMarket={apiMarket}
          marketType={marketType}
        >
          {children}
        </MarketContextProvider>
      </Box>
    </CurveContext>
  </ComponentTestWrapper>
)
