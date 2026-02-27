import { http } from 'viem'
import { createWagmiConfig } from '@ui-kit/features/connect-wallet'
import { ethereum } from '@ui-kit/features/connect-wallet/lib/wagmi/custom-chains'
import { createTestConnector } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-test'
import { TEST_PRIVATE_KEY } from './mock-loan-test-data'

export const testWagmiConfig = createWagmiConfig({
  chains: [ethereum],
  connectors: [createTestConnector({ privateKey: TEST_PRIVATE_KEY, chain: ethereum })],
  transports: { [ethereum.id]: http() },
})
