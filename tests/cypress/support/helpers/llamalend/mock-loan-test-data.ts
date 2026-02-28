import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

export const TEST_PRIVATE_KEY = generatePrivateKey()
export const TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY)
export const TEST_ADDRESS = TEST_ACCOUNT.address
// Real mined Ethereum mainnet transaction hash used to avoid any RPC mocking in component tests.
export const TEST_TX_HASH: `0x${string}` = '0xb664cb54f72491d8f459bb2a0db0bf074b30fa0fb1179a989ff4e1932291a69d'

export const createMockLlamaApi = (chainId: number, mockMarket: unknown) => ({
  ___mock: true,
  chainId,
  signerAddress: TEST_ADDRESS,
  getUsdRate: async () => 1,
  getMintMarket: () => mockMarket,
  getLendMarket: () => mockMarket,
})
