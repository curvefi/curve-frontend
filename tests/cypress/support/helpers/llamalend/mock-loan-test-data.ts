import { privateKeyToAccount } from 'viem/accounts'

const privateKey: `0x${string}` = `0x${'1'.repeat(64)}`
const account = privateKeyToAccount(privateKey)

export const TEST_PRIVATE_KEY = privateKey
export const TEST_ADDRESS = account.address
// Real mined Ethereum mainnet transaction hash used to avoid any RPC mocking in component tests.
export const TEST_TX_HASH: `0x${string}` = '0xb664cb54f72491d8f459bb2a0db0bf074b30fa0fb1179a989ff4e1932291a69d'

export const createMockLlamaApi = (chainId: number, mockMarket: unknown) => ({
  chainId,
  signerAddress: TEST_ADDRESS,
  getUsdRate: async () => 1,
  getMintMarket: () => mockMarket,
  getLendMarket: () => mockMarket,
})
