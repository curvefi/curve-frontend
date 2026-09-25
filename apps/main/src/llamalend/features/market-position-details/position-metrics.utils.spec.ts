import { describe, expect, it } from 'vitest'
import { derivePositionView } from '@/llamalend/position-metrics/derive'
import { MarketAssetsType } from '@evm-ui/types/market'
import { decimal } from '@ui/lib/decimal'
import { currentLoanLeverageEligibility } from './leverage-eligibility.utils'
import {
  bufferAmount,
  collateralValue,
  compositionShares,
  equity,
  formatDistancePercent,
  formatOracleHealth,
  formatSignedAmount,
  formatSignedPercent,
  leverage,
  oracleHealth,
  priceDistance,
} from './position-metrics.utils'
import { positionReturnOnEquity, formatYieldMultiplier } from './position-roe.utils'
import { resolvePositionStatus } from './position-status.utils'

const d = (value: string | number) => {
  const parsed = decimal(value)
  if (parsed == undefined) throw new Error(`bad decimal ${value}`)
  return parsed
}

describe('position metrics', () => {
  it('matches the canonical price fixtures', () => {
    expect(oracleHealth(d(120), d(100))).toBe('1.2')
    const above = oracleHealth(d(120), d(100))
    expect(above).toBeDefined()
    if (above) expect(formatOracleHealth(above)).toBe('1.20')
    expect(oracleHealth(d(1), d(0))).toBeUndefined()
    expect(priceDistance(d(0), d(100), d(80)).location).toBe('unavailable')
    expect(priceDistance(d(100), d(80), d(100)).location).toBe('unavailable')
    const drop = priceDistance(d(120), d(100), d(80))
    expect(drop.location).toBe('above')
    if (drop.location === 'above') expect(+drop.percent).toBeCloseTo(16.666666, 4)
    expect(oracleHealth(d(70), d(100))).toBe('1')
    const rise = priceDistance(d(70), d(100), d(80))
    expect(rise.location).toBe('below')
    if (rise.location === 'below') expect(+rise.percent).toBeCloseTo(14.285714, 4)
    expect(formatOracleHealth(d('1.004'))).not.toBe('1.00')
    expect(priceDistance(d(100), d(100), d(80)).location).toBe('inside')
    expect(priceDistance(d(80), d(100), d(80)).location).toBe('inside')
    expect(priceDistance(d('100.0001'), d(100), d(80)).location).toBe('above')
    expect(formatDistancePercent(d('0.0001'))).toBe('<0.01%')
  })

  it('keeps buffer sign and the debt-times-health amount', () => {
    expect(bufferAmount(d(20000), d('3.27'))).toBe('654')
    expect(formatSignedPercent(d(0))).toBe('0.00%')
    expect(formatSignedPercent(d('0.004'))).toBe('<0.01%')
    expect(formatSignedPercent(d('-0.004'))).toBe('−<0.01%')
    expect(formatSignedAmount(d('-12.5'))).toBe('-12.50')
    expect(formatSignedPercent(d('-3'))).toBe('-3.00%')
  })

  it('matches collateral, leverage, and ROE fixtures', () => {
    const plain = {
      collateral: d(300),
      borrowed: d(0),
      debt: d(200),
    }
    const assets = collateralValue(d(300 / 120), d(120), plain.borrowed)
    expect(+assets).toBeCloseTo(300, 8)
    expect(+equity(assets, plain.debt)).toBeCloseTo(100, 8)
    expect(+(leverage(d(300), d(100)) ?? 0)).toBeCloseTo(3, 8)
    const roe = positionReturnOnEquity({
      collateralValue: d(300),
      borrowedValue: d(0),
      debt: d(200),
      equity: d(100),
      collateralYield: { aprFraction: d('0.03') },
      borrowedYield: { unnecessary: true },
      borrowCost: { aprFraction: d('0.02') },
      rewards: { unnecessary: true },
    })
    expect(roe.status).toBe('value')
    if (roe.status === 'value') {
      expect(+roe.aprPercent).toBeCloseTo(5, 8)
      expect(formatYieldMultiplier(roe.multiplier)).toBe('1.6667× yield')
    }

    const mixed = compositionShares(d(180), d(90), d(270))
    expect(+(mixed?.collateralLabel ?? 0)).toBeCloseTo(66.6667, 4)
    expect(+(mixed?.borrowedLabel ?? 0)).toBeCloseTo(33.3333, 4)
    expect(+((mixed?.collateralLabel ?? d(0)) as unknown as number) + +((mixed?.borrowedLabel ?? d(0)) as unknown as number)).toBeCloseTo(100, 4)
    const mixedRoe = positionReturnOnEquity({
      collateralValue: d(180),
      borrowedValue: d(90),
      debt: d(200),
      equity: d(70),
      collateralYield: { aprFraction: d('0.03') },
      borrowedYield: { aprFraction: d(0) },
      borrowCost: { aprFraction: d('0.02') },
      rewards: { unnecessary: true },
    })
    expect(mixedRoe.status).toBe('value')
    if (mixedRoe.status === 'value') {
      expect(+mixedRoe.aprPercent).toBeCloseTo(2, 6)
      expect(formatYieldMultiplier(mixedRoe.multiplier)).toBe('0.6667× yield')
    }
    expect(leverage(d(180), d(70)) && +leverage(d(180), d(70))!).toBeCloseTo(2.571428, 4)

    const converted = positionReturnOnEquity({
      collateralValue: d(0),
      borrowedValue: d(210),
      debt: d(200),
      equity: d(10),
      collateralYield: { aprFraction: d('0.03') },
      borrowedYield: { aprFraction: d(0) },
      borrowCost: { aprFraction: d('0.02') },
      rewards: { unnecessary: true },
    })
    expect(converted.status).toBe('value')
    expect(leverage(d(0), d(10))).toBe('0')
    if (converted.status === 'value') expect(formatYieldMultiplier(converted.multiplier)).toBe('Net yield negative')
    expect(leverage(d(1), d(0))).toBeUndefined()
    expect(
      positionReturnOnEquity({
        collateralValue: d(1),
        borrowedValue: d(0),
        debt: d(1),
        equity: d(0),
        collateralYield: { aprFraction: d('0.03') },
        borrowedYield: { unnecessary: true },
        borrowCost: { aprFraction: d('0.02') },
        rewards: { unnecessary: true },
      }).status,
    ).toBe('unavailable')
  })
})

describe('shared position view', () => {
  const view = derivePositionView({
    oraclePrice: d(120),
    upperPrice: d(100),
    lowerPrice: d(80),
    debt: d(200),
    collateralTokenAmount: d(300 / 120),
    borrowedAssetInAmm: d(0),
    fullHealthPercentagePoints: d(50),
    liquidationPredicate: 'strict-negative',
    assetsType: MarketAssetsType.Correlated,
    collateralYield: { aprFraction: d('0.03') },
    borrowedYield: { unnecessary: true },
    borrowCost: { aprFraction: d('0.02') },
    rewards: { unnecessary: true },
  })

  it('asserts the result before reading the fixture values', () => {
    expect(view.oracleHealthFactor).toBeDefined()
    expect(view.distance.location).toBe('above')
    expect(view.roeApr.status).toBe('value')
    expect(view.status?.label).toBe('Healthy')
  })

  it('matches the canonical health, leverage, and buffer amount', () => {
    expect(view.oracleHealthFactor).toBe('1.2')
    if (view.distance.location === 'above') expect(+view.distance.percent).toBeCloseTo(16.666666, 4)
    expect(+view.collateralValue).toBeCloseTo(300, 6)
    expect(+view.equity).toBeCloseTo(100, 6)
    expect(+(view.directionalLeverage ?? 0)).toBeCloseTo(3, 6)
    expect(view.liquidationBufferAmount).toBe('100')
    if (view.roeApr.status === 'value') expect(+view.roeApr.aprPercent).toBeCloseTo(5, 6)
  })

  it('uses collateral-token value over equity when borrowed tokens are present', () => {
    const mixed = derivePositionView({
      oraclePrice: d(1),
      upperPrice: d(1),
      lowerPrice: d('0.8'),
      debt: d(200),
      collateralTokenAmount: d(180),
      borrowedAssetInAmm: d(90),
      fullHealthPercentagePoints: d(50),
      liquidationPredicate: 'strict-negative',
      assetsType: MarketAssetsType.Correlated,
      collateralYield: { aprFraction: d('0.03') },
      borrowedYield: { aprFraction: d(0) },
      borrowCost: { aprFraction: d('0.02') },
      rewards: { unnecessary: true },
    })
    expect(+mixed.equity).toBeCloseTo(70, 6)
    expect(+(mixed.directionalLeverage ?? 0)).toBeCloseTo(180 / 70, 6)
    expect(mixed.roeApr.status).toBe('value')
    if (mixed.roeApr.status === 'value') expect(+mixed.roeApr.aprPercent).toBeCloseTo(2, 6)
  })

  it('does not turn a zero oracle into a range location', () => {
    const invalid = derivePositionView({
      ...{
        oraclePrice: d(0),
        upperPrice: d(100),
        lowerPrice: d(80),
        debt: d(1),
        collateralTokenAmount: d(1),
        borrowedAssetInAmm: d(0),
        fullHealthPercentagePoints: d(1),
        liquidationPredicate: 'strict-negative' as const,
        assetsType: MarketAssetsType.Correlated,
        collateralYield: { unnecessary: true as const },
        borrowedYield: { unnecessary: true as const },
        borrowCost: { unnecessary: true as const },
        rewards: { unnecessary: true as const },
      },
    })
    expect(invalid.oracleHealthFactor).toBeUndefined()
    expect(invalid.distance.location).toBe('unavailable')
    expect(invalid.status).toBeUndefined()
  })
})

describe('position status', () => {
  const base = {
    oraclePrice: d(120),
    upperPrice: d(100),
    lowerPrice: d(80),
    collateralQuantity: d(1),
    liquidationPredicate: 'strict-negative' as const,
    assetsType: MarketAssetsType.Correlated,
  }

  it('prioritizes liquidation over a reassuring health value', () => {
    expect(resolvePositionStatus({ ...base, fullHealth: d(-1) }).label).toBe('Liquidatable')
    expect(resolvePositionStatus({ ...base, fullHealth: d(2), oraclePrice: d(90) }).label).not.toBe('Liquidatable')
  })

  it('treats exact zero as critical for a strict-negative predicate', () => {
    expect(resolvePositionStatus({ ...base, fullHealth: d(0) }).label).toBe('Critical buffer')
  })

  it('does not call an uncategorized position healthy', () => {
    expect(resolvePositionStatus({ ...base, fullHealth: d(50), assetsType: undefined }).label).toBe('Above range')
  })

  it('uses category proximity only above the range', () => {
    expect(resolvePositionStatus({ ...base, oraclePrice: d(105), fullHealth: d(50) }).label).toBe('Near range')
    expect(resolvePositionStatus({ ...base, oraclePrice: d(90), fullHealth: d(50) }).label).toBe('Liquidation Protection')
    expect(resolvePositionStatus({ ...base, oraclePrice: d(70), fullHealth: d(50), collateralQuantity: d(0) }).label).toBe(
      'Fully converted',
    )
    expect(resolvePositionStatus({ ...base, oraclePrice: d(70), fullHealth: d(50), collateralQuantity: d(1) }).label).toBe(
      'Partially converted',
    )
  })

  it('does not claim Healthy when liquidation semantics are unverified', () => {
    const status = resolvePositionStatus({ ...base, fullHealth: d(50), liquidationPredicate: 'unverified' })
    expect(status.label).toBe('Above range')
    expect(status.liquidationUnsupported).toBe(true)
  })

  it('keeps distance status above range when the buffer is low or critical', () => {
    const low = resolvePositionStatus({ ...base, fullHealth: d(5) })
    expect(low.label).toBe('Healthy')
    expect(low.lead).toBe('health')
    expect(low.bufferWarning).toEqual({ label: 'Low buffer', severity: 'low' })
    const critical = resolvePositionStatus({ ...base, fullHealth: d(1) })
    expect(critical.label).toBe('Healthy')
    expect(critical.lead).toBe('health')
    expect(critical.bufferWarning?.label).toBe('Critical buffer')
  })

  it('leads with the buffer for zero, negative, inside, and below', () => {
    expect(resolvePositionStatus({ ...base, fullHealth: d(0) }).lead).toBe('buffer')
    expect(resolvePositionStatus({ ...base, fullHealth: d(-1) }).lead).toBe('buffer')
    expect(resolvePositionStatus({ ...base, oraclePrice: d(90), fullHealth: d(50) }).lead).toBe('buffer')
    expect(resolvePositionStatus({ ...base, oraclePrice: d(70), fullHealth: d(50) }).lead).toBe('buffer')
  })

  it('changes the label when the same numbers use another category', () => {
    const input = { ...base, oraclePrice: d(110), fullHealth: d(50) }
    expect(resolvePositionStatus({ ...input, assetsType: MarketAssetsType.Correlated }).label).toBe('Healthy')
    expect(resolvePositionStatus({ ...input, assetsType: MarketAssetsType.LongTail }).label).toBe('Near range')
  })

  it('closes a position with no debt', () => {
    const status = resolvePositionStatus({ ...base, debt: d(0), fullHealth: d(10) })
    expect(status.label).toBe('Position closed')
    expect(status.lead).toBe('neither')
  })
})

describe('leverage eligibility', () => {
  const closed = { timestamp: 1, isPositionClosed: true, leverage: { eventType: 'Deposit' as const } }
  const ordinary = { timestamp: 2, isPositionClosed: false, leverage: null }

  it('ignores leverage from a closed episode when ordinary borrowing is verified', () => {
    expect(
      currentLoanLeverageEligibility({
        events: [closed, ordinary],
        count: 2,
        page: 1,
        pagination: 1,
        nullMeansOrdinaryBorrow: true,
      }).eligibility,
    ).toBe('no')
  })

  it('does not treat a partial liquidation as closing the episode', () => {
    expect(
      currentLoanLeverageEligibility({
        events: [{ timestamp: 1, isPositionClosed: false, leverage: { eventType: 'Deposit' } }],
        count: 1,
        page: 1,
        pagination: 1,
        nullMeansOrdinaryBorrow: true,
      }).eligibility,
    ).toBe('yes')
  })

  it('stays unknown when equal timestamps have no log order', () => {
    expect(
      currentLoanLeverageEligibility({
        events: [
          { timestamp: 5, isPositionClosed: true, leverage: null },
          { timestamp: 5, isPositionClosed: false, leverage: { eventType: 'Deposit' } },
        ],
        count: 2,
        page: 1,
        pagination: 1,
        nullMeansOrdinaryBorrow: false,
      }).eligibility,
    ).toBe('unknown')
  })

  it('stays unknown when the page is incomplete or null is unverified', () => {
    expect(
      currentLoanLeverageEligibility({
        events: [ordinary],
        count: 4,
        page: 1,
        pagination: 2,
        nullMeansOrdinaryBorrow: true,
      }).eligibility,
    ).toBe('unknown')
    expect(
      currentLoanLeverageEligibility({
        events: [ordinary],
        count: 1,
        page: 1,
        pagination: 1,
        nullMeansOrdinaryBorrow: false,
      }).eligibility,
    ).toBe('unknown')
  })
})
