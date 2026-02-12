import { type ReactElement } from 'react'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import Box from '@mui/material/Box'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet'
import { CurveContext } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { ConnectState } from '@ui-kit/features/connect-wallet/lib/types'
import { createTestConnector } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-test'
import { ComponentTestWrapper } from '../ComponentTestWrapper'
import { createMockLlamaApi, TEST_ADDRESS, TEST_PRIVATE_KEY } from './mock-loan-test-data'

const wagmiConfig = createWagmiConfig({
  chains: [mainnet],
  connectors: [createTestConnector({ privateKey: TEST_PRIVATE_KEY, chain: mainnet })],
  transports: { [mainnet.id]: http() },
})

type MockLoanTestWrapperProps = {
  children: ReactElement
  chainId: number
  mockMarket: unknown
  llamaApi?: ReturnType<typeof createMockLlamaApi>
}

export function MockLoanTestWrapper({ children, chainId, mockMarket, llamaApi }: MockLoanTestWrapperProps) {
  const mockLlamaApi = llamaApi ?? createMockLlamaApi(chainId, mockMarket)

  return (
    <ComponentTestWrapper config={wagmiConfig}>
      <CurveContext.Provider
        value={{
          connectState: ConnectState.SUCCESS,
          isHydrated: true,
          isReconnecting: false,
          llamaApi: mockLlamaApi as never,
          wallet: { provider: { request: async () => undefined }, address: TEST_ADDRESS },
        }}
      >
        <Box sx={{ maxWidth: 520 }}>{children}</Box>
      </CurveContext.Provider>
    </ComponentTestWrapper>
  )
}
