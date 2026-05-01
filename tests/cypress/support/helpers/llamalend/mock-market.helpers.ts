import { zeroAddress } from 'viem'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { oneAddress, oneDecimal, oneValueOf } from '@cy/support/generators'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD_ADDRESS, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockMethod = (...args: any[]) => Promise<any>

export const oneMarketType = () => oneValueOf(LlamaMarketType)

// Borrow-side tests rely on the MintMarketTemplate prototype and mint-specific methods.
export const createMockMintMarket = (overrides: object) =>
  Object.assign(Object.create(MintMarketTemplate.prototype), {
    id: 'wsteth',
    collateralSymbol: 'wstETH',
    collateral: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    collateralDecimals: 18,
    controller: '0x1234567890123456789012345678901234567890',
    leverageZap: zeroAddress,
    deleverageZap: zeroAddress,
    leverageV2: { hasLeverage: () => false },
    oraclePrice: cy.stub().resolves(oneDecimal(1, 1.2, 3)),
    oraclePriceBand: cy.stub().resolves(oneDecimal(10, 20, 30)),
    ...overrides,
  }) as MintMarketTemplate

const createMockLendRates = () => ({ borrowApr: '0.1', borrowApy: '0.1', lendApr: '0.04', lendApy: '0.04' })

export type MockLendStats = {
  rates: MockMethod
  futureRates: MockMethod
}

export const createMockLendStats = (): MockLendStats => ({
  rates: cy.stub().resolves(createMockLendRates()),
  futureRates: cy.stub().resolves(createMockLendRates()),
})

export type MockLendWallet = {
  balances: MockMethod
}

export const createMockLendWallet = (): MockLendWallet => ({
  balances: cy.stub().resolves({
    collateral: '0',
    borrowed: '0',
    vaultShares: '0',
    gauge: '0',
  }),
})

export type MockLendEstimateGas = {
  depositApprove: MockMethod
  deposit: MockMethod
  stakeApprove: MockMethod
  stake: MockMethod
  withdraw: MockMethod
  redeem: MockMethod
  unstake: MockMethod
  claimCrv: MockMethod
  claimRewards: MockMethod
}

export const createMockLendEstimateGas = (): MockLendEstimateGas => ({
  depositApprove: cy.stub().resolves('120000'),
  deposit: cy.stub().resolves('120000'),
  stakeApprove: cy.stub().resolves('120000'),
  stake: cy.stub().resolves('120000'),
  withdraw: cy.stub().resolves('120000'),
  redeem: cy.stub().resolves('120000'),
  unstake: cy.stub().resolves('120000'),
  claimCrv: cy.stub().resolves('120000'),
  claimRewards: cy.stub().resolves('120000'),
})

export type MockLendVault = {
  estimateGas: MockLendEstimateGas
  maxDeposit: MockMethod
  maxWithdraw: MockMethod
  maxRedeem: MockMethod
  convertToAssets: MockMethod
  previewDeposit: MockMethod
  previewWithdraw: MockMethod
  depositIsApproved: MockMethod
  depositApprove: MockMethod
  deposit: MockMethod
  stakeIsApproved: MockMethod
  stakeApprove: MockMethod
  stake: MockMethod
  withdraw: MockMethod
  redeem: MockMethod
  unstake: MockMethod
  claimableCrv: MockMethod
  claimableRewards: MockMethod
  claimCrv: MockMethod
  claimRewards: MockMethod
}

export const createMockLendVault = (): MockLendVault => ({
  estimateGas: createMockLendEstimateGas(),
  maxDeposit: cy.stub().resolves('0'),
  maxWithdraw: cy.stub().resolves('0'),
  maxRedeem: cy.stub().resolves('0'),
  convertToAssets: cy.stub().callsFake(async (shares: string) => shares),
  previewDeposit: cy.stub().resolves('0'),
  previewWithdraw: cy.stub().resolves('0'),
  depositIsApproved: cy.stub().resolves(true),
  depositApprove: cy.stub().resolves([]),
  deposit: cy.stub().resolves(zeroAddress),
  stakeIsApproved: cy.stub().resolves(true),
  stakeApprove: cy.stub().resolves([]),
  stake: cy.stub().resolves(zeroAddress),
  withdraw: cy.stub().resolves(zeroAddress),
  redeem: cy.stub().resolves(zeroAddress),
  unstake: cy.stub().resolves(zeroAddress),
  claimableCrv: cy.stub().resolves('0'),
  claimableRewards: cy.stub().resolves([]),
  claimCrv: cy.stub().resolves(zeroAddress),
  claimRewards: cy.stub().resolves(zeroAddress),
})

// Supply-side tests rely on the LendMarketTemplate prototype plus vault/gauge APIs.
export const createMockLendMarket = (overrides: object) =>
  Object.assign(Object.create(LendMarketTemplate.prototype), {
    id: 'one-way-market-7',
    llamalend: {
      constants: {
        ALIASES: {
          crv: MAINNET_CRV_ADDRESS,
        },
      },
    },
    collateral_token: {
      symbol: 'wstETH',
      address: oneAddress(),
      decimals: 18,
    },
    borrowed_token: {
      symbol: 'crvUSD',
      address: CRVUSD_ADDRESS,
      decimals: 18,
    },
    addresses: {
      controller: oneAddress(),
      vault: oneAddress(),
      gauge: oneAddress(),
    },
    leverage: { hasLeverage: () => false },
    leverageZapV2: { hasLeverage: () => false },
    stats: createMockLendStats(),
    wallet: createMockLendWallet(),
    vault: createMockLendVault(),
    ...overrides,
  }) as LendMarketTemplate
