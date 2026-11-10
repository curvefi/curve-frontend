import { describe, expect, it } from 'vitest'
import type { LlamaMarketRow, MarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ, DISABLED_Q } from '@ui/features/queries/util'
import {
  getUserBandCount,
  getUserCollateralShare,
  getUserHealthFactor,
  getUserLeverage,
  getUserLiquidationBuffer,
  getUserLiquidationBufferAmount,
  getUserLoopedApr,
  getUserIncentivesApr,
  getUserPositionLtv,
  getUserSupplyShare,
  getUserSupplyTotalApy,
  getUserYieldMultiplier,
} from './user-position.utils'

/** 10 collateral at an oracle price of 1 against 5 debt, earning 6% on the collateral and paying 3% on the debt */
const POSITION = { collateral: '10' as Decimal, convertedBorrowed: '0' as Decimal, debt: '5' as Decimal }

const STATS = {
  position: POSITION,
  borrowed: 5,
  oraclePrice: '1' as Decimal,
  healthFactor: '1.2' as Decimal,
  healthNotFull: '0.6' as Decimal,
  bandCount: 4,
} satisfies Partial<MarketStats>

const createRow = ({
  stats = STATS,
  isZapLeveraged = true,
  collateralYieldApr = 6,
  loanDiscount = '3',
  liquidationDiscount = '2.5',
}: {
  stats?: Partial<MarketStats> | null
  isZapLeveraged?: boolean | null
  collateralYieldApr?: number | null
  loanDiscount?: string
  liquidationDiscount?: string
} = {}) =>
  ({
    assets: {
      collateral: { symbol: 'sDOLA', rebasingYieldApr: collateralYieldApr },
      borrowed: { symbol: 'crvUSD', rebasingYieldApr: null },
    },
    parameters: { loanDiscount, liquidationDiscount },
    rates: { borrowApr: 3 },
    rewards: [],
    positionQueries: {
      stats: stats ? constQ(stats) : DISABLED_Q,
      isZapLeveraged: isZapLeveraged == null ? DISABLED_Q : constQ(isZapLeveraged),
    },
  }) as unknown as LlamaMarketRow

describe('borrow position metrics', () => {
  it('shows the liquidation buffer and the debt it stands for', () => {
    const row = createRow()
    // 0.6% health over the 0.5% gap between the loan and liquidation discounts
    expect(getUserLiquidationBuffer(row)).toBeCloseTo(120)
    // 0.6% of the 5 debt
    expect(getUserLiquidationBufferAmount(row)).toBeCloseTo(0.03)
  })

  it('shows no liquidation buffer without a gap between the discounts', () =>
    expect(getUserLiquidationBuffer(createRow({ loanDiscount: '2.5' }))).toBeUndefined())

  it('shows the LTV at the oracle price', () => expect(getUserPositionLtv(createRow())).toBeCloseTo(50))

  it('shows no LTV nor collateral composition without collateral value', () => {
    const row = createRow({ stats: { ...STATS, position: { ...POSITION, collateral: '0' } } })
    expect(getUserPositionLtv(row)).toBeUndefined()
    expect(getUserCollateralShare(row)).toBeUndefined()
  })

  it('counts the converted tokens in the LTV and the collateral composition', () => {
    const row = createRow({ stats: { ...STATS, position: { ...POSITION, collateral: '8', convertedBorrowed: '2' } } })
    expect(getUserPositionLtv(row)).toBeCloseTo(50)
    expect(getUserCollateralShare(row)).toBeCloseTo(80)
  })

  it('shows the leverage as the collateral value over the equity', () =>
    expect(getUserLeverage(createRow())).toBeCloseTo(2))

  it('shows the looped APR on the equity and its yield multiplier', () => {
    const row = createRow()
    // (10 × 6% − 5 × 3%) / 5 equity
    expect(getUserLoopedApr(row)).toBeCloseTo(9)
    expect(getUserYieldMultiplier(row)).toBeCloseTo(1.5)
  })

  it('shows no leverage nor looped APR for a plain borrow', () => {
    const row = createRow({ isZapLeveraged: false })
    expect(getUserLeverage(row)).toBeUndefined()
    expect(getUserLoopedApr(row)).toBeUndefined()
    expect(getUserYieldMultiplier(row)).toBeUndefined()
  })

  it('shows no leverage nor looped APR while it is unknown if the position is zap leveraged', () => {
    const row = createRow({ isZapLeveraged: null })
    expect(getUserLeverage(row)).toBeUndefined()
    expect(getUserLoopedApr(row)).toBeUndefined()
    expect(getUserYieldMultiplier(row)).toBeUndefined()
  })

  it('shows no looped APR without a collateral yield', () => {
    const row = createRow({ collateralYieldApr: null })
    expect(getUserLoopedApr(row)).toBeUndefined()
    expect(getUserYieldMultiplier(row)).toBeUndefined()
  })

  it('shows the health factor', () => expect(getUserHealthFactor(createRow())).toBe(1.2))

  it('shows the band count', () => expect(getUserBandCount(createRow())).toBe(4))

  it('shows nothing while the position stats are missing', () => {
    const row = createRow({ stats: null })
    expect(
      [
        getUserLiquidationBuffer(row),
        getUserLiquidationBufferAmount(row),
        getUserPositionLtv(row),
        getUserCollateralShare(row),
        getUserLeverage(row),
        getUserLoopedApr(row),
        getUserBandCount(row),
      ].filter(value => value != null),
    ).toEqual([])
  })
})

/** 250 supplied out of the vault's 1000, earning 1% CRV unboosted, 0.5% extra incentives and a 0.25% campaign */
const createSupplyRow = (boostMultiplier: number | null) =>
  ({
    assets: { collateral: { balance: 1000 }, borrowed: { rebasingYield: null } },
    rates: {
      lendApy: 4,
      lendCrvAprUnboosted: 1,
      lendCrvAprBoosted: 2.5,
      lendTotalApyMinBoosted: 5,
      incentives: [{ title: 'OP', percentage: 0.5 }],
    },
    rewards: [
      { action: 'supply', reward: { type: 'apr', value: 0.25 } },
      { action: 'borrow', reward: { type: 'apr', value: 10 } },
    ],
    lendingPosition: { supplied: 250, earnings: 0, boostMultiplier },
  }) as unknown as LlamaMarketRow

describe('supply position metrics', () => {
  it('shows the share of the vault the user supplied', () =>
    expect(getUserSupplyShare(createSupplyRow(null))).toBeCloseTo(25))

  it('shows the incentives APR at the user boost', () =>
    expect(getUserIncentivesApr(createSupplyRow(2))).toBeCloseTo(2 + 0.5 + 0.25))

  it('shows the unboosted incentives APR without a boost', () =>
    expect(getUserIncentivesApr(createSupplyRow(null))).toBeCloseTo(1 + 0.5 + 0.25))

  it('keeps the incentives APR when the market has no CRV rewards', () => {
    const row = createSupplyRow(2)
    const noCrv = { ...row, rates: { ...row.rates, lendCrvAprUnboosted: null } } as LlamaMarketRow
    expect(getUserIncentivesApr(noCrv)).toBeCloseTo(0.5 + 0.25)
    const nothing = { ...noCrv, rates: { ...noCrv.rates, incentives: [] }, rewards: [] } as unknown as LlamaMarketRow
    expect(getUserIncentivesApr(nothing)).toBeUndefined()
  })

  it('adds the boosted CRV yield to the total supply APY', () => {
    expect(getUserSupplyTotalApy(createSupplyRow(null))).toBe(5)
    expect(getUserSupplyTotalApy(createSupplyRow(2))).toBeGreaterThan(getUserSupplyTotalApy(createSupplyRow(1)) ?? 0)
  })

  it('shows no supply share without a vault balance', () =>
    expect(
      getUserSupplyShare({ ...createSupplyRow(null), assets: { collateral: { balance: null } } } as LlamaMarketRow),
    ).toBeUndefined())
})
