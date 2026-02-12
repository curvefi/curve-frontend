import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet'
import { createTestConnector } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-test'
import { TEST_PRIVATE_KEY } from './mock-loan-test-data'

export const testWagmiConfig = createWagmiConfig({
  chains: [mainnet],
  connectors: [createTestConnector({ privateKey: TEST_PRIVATE_KEY, chain: mainnet })],
  transports: { [mainnet.id]: http() },
})
