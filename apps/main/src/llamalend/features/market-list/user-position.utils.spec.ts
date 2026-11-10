import { describe, expect, it } from 'vitest'
import type { LlamaMarketRow, MarketStats } from '@/llamalend/queries/market-list/llama-market-stats'
import type { PositionHealth } from '@/llamalend/health.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { constQ, DISABLED_Q, type Range } from '@ui/features/queries/util'
import {
  getUserBandCount,
  getUserCollateralShare,
  getUserDistanceToRange,
  getUserHealth,
  getUserLeverage,
  getUserLiquidationBuffer,
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
  positionHealth: {
    health: '1.2',
    liquidationBuffer: '120',
    liquidationBufferAmount: '6',
    liquidationBufferShare: '1',
    isLiquidatable: false,
    status: 'aboveRange',
  } satisfies PositionHealth,
  rangePrices: ['0.8', '0.9'] satisfies Range<Decimal>,
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
  it('shows the health and the liquidation buffer', () => {
    const row = createRow()
    expect(getUserHealth(row)).toBe(1.2)
    expect(getUserLiquidationBuffer(row)).toBe(120)
  })

  it('shows the price drop needed to reach the range above it', () =>
    expect(getUserDistanceToRange(createRow({ stats: { ...STATS, oraclePrice: '1' } }))).toBeCloseTo(-10))

  it('shows no distance inside the range', () =>
    expect(getUserDistanceToRange(createRow({ stats: { ...STATS, oraclePrice: '0.85' } }))).toBe(0))

  it('shows the price rise needed to reach the range below it', () =>
    expect(getUserDistanceToRange(createRow({ stats: { ...STATS, oraclePrice: '0.72' } }))).toBeCloseTo(11.11, 2))

  it('shows no health nor distance without the range prices', () => {
    const row = createRow({ stats: { ...STATS, positionHealth: undefined, rangePrices: undefined } })
    expect(getUserHealth(row)).toBeUndefined()
    expect(getUserLiquidationBuffer(row)).toBeUndefined()
    expect(getUserDistanceToRange(row)).toBeUndefined()
  })

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

  it('shows the band count', () => expect(getUserBandCount(createRow())).toBe(4))

  it('shows nothing while the position stats are missing', () => {
    const row = createRow({ stats: null })
    expect(
      [
        getUserLiquidationBuffer(row),
        getUserHealth(row),
        getUserDistanceToRange(row),
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
