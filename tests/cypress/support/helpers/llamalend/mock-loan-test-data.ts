import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { UserBorrowEvents } from '@/llamalend/features/user-position-history/hooks/useUserBorrowEvents'

export const TEST_PRIVATE_KEY = generatePrivateKey()
const TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY)
export const TEST_ADDRESS = TEST_ACCOUNT.address
// Deterministic transaction hash with a mocked receipt in mocked LlamaLend component tests.
export const TEST_TX_HASH: `0x${string}` = '0xb664cb54f72491d8f459bb2a0db0bf074b30fa0fb1179a989ff4e1932291a69d'
export const ZAP_V2_OVER_LEGACY_LIMIT_CALLDATA = `0x${'00'.repeat(9_401)}` as const
export const DEFAULT_CONTROLLER_APPROVAL_TEST_CASE = {
  controllerApproved: undefined,
  marketVersion: undefined,
  routeCalldata: undefined,
}

export const createMockLlamaApi = (chainId: number, mockMarket: unknown) => ({
  ___mock: true,
  chainId,
  signerAddress: TEST_ADDRESS,
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  getUsdRate: async () => 1,
  getMintMarket: () => mockMarket,
  getLendMarket: () => mockMarket,
  setCustomFeeData: () => Promise.resolve(undefined),
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  userState: async () => ({ collateral: '0', borrowed: '0', debt: '0', N: '0' }),
})

export const fakeCollateralEvents: UserBorrowEvents = {
  events: [],
  originalLeverage: `1`,
  isZapLeveraged: false,
  openingLeverage: null,
}
