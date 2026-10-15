import { describe, expect, it } from 'vitest'
import { loopedDebt, loopedLeverage } from '@/llamalend/features/market-position-details/position-metrics.utils'
import type { UserCollateralEvents as MintCollateralEvents } from '@curvefi/prices-api/crvusd'
import type { UserCollateralEvents as LendCollateralEvents } from '@curvefi/prices-api/lending'
import { decimal } from '@ui/lib/decimal'
import { lendZapDebtShare, mintZapDebtShare, netInvested } from './zap-debt-share.utils'

const d = (value: string | number) => decimal(value)!
const lev = (collateral: number, price: number, stablecoin: number, debt: number, share: number) =>
  +(loopedLeverage(d(collateral), d(price), d(stablecoin), loopedDebt(d(debt), d(share))) ?? NaN)

type LendEvent = LendCollateralEvents['events'][number]
const event = (type: LendEvent['type'], loanChange: number, zap = false) =>
  ({ type, loanChange, leverage: zap ? {} : undefined }) as LendEvent
const lendEvents = (...events: LendEvent[]) => ({ events }) as LendCollateralEvents

describe('looped leverage', () => {
  it('reads 1× for a plain borrow to the wallet', () => {
    expect(lev(10, 3000, 0, 15000, 0)).toBeCloseTo(1, 8)
  })

  it('reads CEX effective leverage for a full loop and rises as price falls', () => {
    expect(lev(30, 3000, 0, 60000, 1)).toBeCloseTo(3, 8)
    expect(lev(30, 2500, 0, 60000, 1)).toBeCloseTo(5, 8)
  })

  it('counts only the looped part of mixed debt', () => {
    expect(lev(40000 / 3000, 3000, 0, 15000, 2 / 3)).toBeCloseTo(4 / 3, 8)
  })

  it('is undefined without positive equity', () => {
    expect(loopedLeverage(d(1), d(100), d(0), d(100))).toBeUndefined()
  })
})

describe('zap debt share', () => {
  it('splits lending borrows by the zap marker', () => {
    expect(+lendZapDebtShare(lendEvents(event('Borrow', 10000, true), event('Borrow', 5000)))).toBeCloseTo(2 / 3, 8)
  })

  it('starts over after the debt is fully repaid', () => {
    const events = lendEvents(event('Borrow', 10000, true), event('Repay', -10000), event('Borrow', 5000))
    expect(+lendZapDebtShare(events)).toBe(0)
  })

  it('is zero with no borrows', () => {
    expect(+lendZapDebtShare(lendEvents())).toBe(0)
  })

  it('estimates mint share from deposit values and clamps it to 1', () => {
    const totals = (deposit: number, fromUser: number, borrowed: number) =>
      ({
        totalDepositUsdValue: deposit,
        totalDepositFromUserUsdValue: fromUser,
        totalBorrowed: borrowed,
      }) as MintCollateralEvents
    expect(+mintZapDebtShare(totals(40000, 30000, 15000))).toBeCloseTo(2 / 3, 8)
    expect(+mintZapDebtShare(totals(30000, 30000, 15000))).toBe(0)
    expect(+mintZapDebtShare(totals(90000, 30000, 50000))).toBe(1)
  })
})

describe('net invested', () => {
  const flow = (collateralChange: number, oraclePrice: number, loanChange: number) => ({
    collateralChange,
    oraclePrice,
    loanChange,
  })

  it('nets zap debt against the collateral it bought', () => {
    // 10 ETH own + 20 ETH bought with 60k at 3,000: 30k of own capital.
    expect(+netInvested([flow(30, 3000, 60000)])).toBeCloseTo(30000, 6)
  })

  it('counts wallet borrows as withdrawals and repays as deposits', () => {
    const events = [flow(10, 3000, 0.0001), flow(0, 3000, 15000), flow(0, 3100, -5000)]
    expect(+netInvested(events)).toBeCloseTo(30000 - 15000.0001 + 5000, 6)
  })

  it('starts over after the position closes', () => {
    expect(+netInvested([flow(10, 3000, 15000), flow(-10, 2000, -15000), flow(5, 2000, 1000)])).toBeCloseTo(9000, 6)
  })
})
