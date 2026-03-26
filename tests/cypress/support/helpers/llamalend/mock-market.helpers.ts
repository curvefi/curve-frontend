import { zeroAddress } from 'viem'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { oneAddress, oneDecimal } from '@cy/support/generators'
import { CRVUSD_ADDRESS, MAINNET_CRV_ADDRESS } from '@ui-kit/utils'

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
    stats: {
      rates: cy.stub().resolves({
        borrowApr: '0.1',
        borrowApy: '0.1',
        lendApr: '0.04',
        lendApy: '0.04',
      }),
      futureRates: cy.stub().resolves({
        borrowApr: '0.1',
        borrowApy: '0.1',
        lendApr: '0.04',
        lendApy: '0.04',
      }),
    },
    wallet: {
      balances: cy.stub().resolves({
        collateral: '0',
        borrowed: '0',
        vaultShares: '0',
        gauge: '0',
      }),
    },
    vault: {
      estimateGas: {
        depositApprove: cy.stub().resolves('120000'),
        deposit: cy.stub().resolves('120000'),
        stakeApprove: cy.stub().resolves('120000'),
        stake: cy.stub().resolves('120000'),
        withdraw: cy.stub().resolves('120000'),
        redeem: cy.stub().resolves('120000'),
        unstake: cy.stub().resolves('120000'),
        claimCrv: cy.stub().resolves('120000'),
        claimRewards: cy.stub().resolves('120000'),
      },
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
    },
    ...overrides,
  }) as LendMarketTemplate
