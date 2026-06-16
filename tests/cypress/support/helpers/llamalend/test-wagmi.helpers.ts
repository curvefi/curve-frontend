import { createTestWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-test-config'
import { TEST_PRIVATE_KEY } from './mock-loan-test-data'

export const mockedWagmiConfig = createTestWagmiConfig({ privateKey: TEST_PRIVATE_KEY })
