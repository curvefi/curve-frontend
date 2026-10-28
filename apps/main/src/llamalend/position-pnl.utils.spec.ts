import { describe, expect, it } from 'vitest'
import type { UserCollateralEvent } from '@curvefi/prices-api/lending'
import { fromDate } from '@curvefi/prices-api/timestamp'
import { getPositionPnlAndRoe, toPositionCapital } from './position-pnl.utils'

const USER = '0x00000000000000000000000000000000000000aa'
const LIQUIDATOR = '0x00000000000000000000000000000000000000bb'

type Leverage = NonNullable<UserCollateralEvent['leverage']>
type Liquidation = NonNullable<UserCollateralEvent['liquidation']>

const event = ({
  collateralChange = 0,
  loanChange = 0,
  oraclePrice,
  leverage,
  liquidation,
  isPositionClosed = false,
}: Partial<Pick<UserCollateralEvent, 'collateralChange' | 'loanChange' | 'isPositionClosed'>> & {
  oraclePrice: number
  leverage?: Partial<Leverage> & Pick<Leverage, 'eventType'>
  liquidation?: Partial<Liquidation> & Pick<Liquidation, 'liquidator'>
}): UserCollateralEvent => ({
  type: liquidation ? 'Liquidate' : loanChange < 0 ? 'Repay' : 'Borrow',
  user: USER,
  collateralChange,
  collateralChangeUsd: undefined,
  loanChange,
  loanChangeUsd: undefined,
  n1: 0,
  n2: 0,
  oraclePrice,
  isPositionClosed,
  timestamp: fromDate(new Date(0)),
  txHash: '0x0',
  leverage: leverage && {
    user: USER,
    userCollateral: 0,
    userBorrowed: 0,
    userCollateralFromBorrowed: null,
    debt: null,
    leverageCollateral: null,
    stateCollateralUsed: null,
    borrowedFromStateCollateral: null,
    userCollateralUsed: null,
    borrowedFromUserCollateral: null,
    ...leverage,
  },
  liquidation: liquidation && {
    user: USER,
    collateralReceived: 0,
    stablecoinReceived: 0,
    collateralReceivedUsd: 0,
    stablecoinReceivedUsd: 0,
    debt: 0,
    debtUsd: 0,
    ...liquidation,
  },
})

/** PNL of a position holding `collateral` with `debt` and no borrowed tokens in the AMM, at `oraclePrice` */
const pnlAt = (
  events: UserCollateralEvent[],
  {
    collateral,
    debt,
    oraclePrice,
    roeEnabled = true,
  }: { collateral: number; debt: number; oraclePrice: number; roeEnabled?: boolean },
) =>
  getPositionPnlAndRoe({
    equity: `${collateral * oraclePrice - debt}`,
    oraclePrice: `${oraclePrice}`,
    capital: toPositionCapital({ events }),
    roeEnabled,
  })

const expectPnl = (
  pnl: ReturnType<typeof pnlAt>,
  expected: { pnl: number; roe: number | null; pnlC?: number; roeC?: number | null },
) => {
  expect(Number(pnl?.debt.pnl)).toBeCloseTo(expected.pnl, 0)
  if (expected.roe == null) expect(pnl?.debt.roe).toBeNull()
  else expect(Number(pnl?.debt.roe)).toBeCloseTo(expected.roe, 2)
  if (expected.pnlC != null) expect(Number(pnl?.collateral?.pnl)).toBeCloseTo(expected.pnlC, 4)
  if (expected.roeC === null) expect(pnl?.collateral?.roe).toBeNull()
  else if (expected.roeC != null) expect(Number(pnl?.collateral?.roe)).toBeCloseTo(expected.roeC, 2)
}

describe('plain borrow sequence', () => {
  const steps = [
    event({ collateralChange: 10, loanChange: 10_000, oraclePrice: 2000 }),
    event({ loanChange: 5000, oraclePrice: 2200 }),
    event({ loanChange: -6000, oraclePrice: 2100 }),
    event({ collateralChange: 2, oraclePrice: 1900 }),
    event({ collateralChange: -3, oraclePrice: 2300 }),
  ]
  const after = (count: number) => steps.slice(0, count)

  it('opens at zero PNL', () =>
    expectPnl(pnlAt(after(1), { collateral: 10, debt: 10_000, oraclePrice: 2000 }), {
      pnl: 0,
      roe: 0,
      pnlC: 0,
      roeC: 0,
    }))

  it('gains when the price rises', () =>
    expectPnl(pnlAt(after(1), { collateral: 10, debt: 10_000, oraclePrice: 2200 }), {
      pnl: 2000,
      roe: 10,
      pnlC: 0.4545,
      roeC: 4.545,
    }))

  it('keeps PNL through a wallet borrow', () =>
    expectPnl(pnlAt(after(2), { collateral: 10, debt: 15_000, oraclePrice: 2200 }), {
      pnl: 2000,
      roe: 10,
      pnlC: 0.4545,
      roeC: 4.55,
    }))

  it('keeps PNL through a repay', () =>
    expectPnl(pnlAt(after(3), { collateral: 10, debt: 9000, oraclePrice: 2100 }), {
      pnl: 1000,
      roe: 5,
      pnlC: 0.1299,
      roeC: 1.3,
    }))

  it('counts added collateral as invested', () =>
    expectPnl(pnlAt(after(4), { collateral: 12, debt: 9000, oraclePrice: 1900 }), {
      pnl: -1000,
      roe: -4.2,
      pnlC: -0.3213,
      roeC: -2.68,
    }))

  it('counts removed collateral as returned', () =>
    expectPnl(pnlAt(after(5), { collateral: 9, debt: 9000, oraclePrice: 2300 }), {
      pnl: 3800,
      roe: 22.49,
      pnlC: 0.5025,
      roeC: 5.58,
    }))
})

describe('zap borrow sequence with a 1% swap cost', () => {
  const steps = [
    event({
      collateralChange: 19.9,
      loanChange: 20_000,
      oraclePrice: 2000,
      leverage: { eventType: 'Deposit', userCollateral: 10 },
    }),
    event({ collateralChange: 4.5, loanChange: 10_000, oraclePrice: 2200, leverage: { eventType: 'Deposit' } }),
    event({
      collateralChange: -3,
      loanChange: -6237,
      oraclePrice: 2100,
      leverage: { eventType: 'Repay', borrowedFromStateCollateral: 6237 },
    }),
    event({ collateralChange: 2, oraclePrice: 1900 }),
    event({ collateralChange: -3, oraclePrice: 2300 }),
  ]
  const after = (count: number) => steps.slice(0, count)

  it('loses the swap cost on open', () =>
    expectPnl(pnlAt(after(1), { collateral: 19.9, debt: 20_000, oraclePrice: 2000 }), { pnl: -200, roe: -1 }))

  it('does not count a zap borrow as own capital', () =>
    expectPnl(pnlAt(after(2), { collateral: 24.4, debt: 30_000, oraclePrice: 2200 }), { pnl: 3680, roe: 18.4 }))

  it('does not count a zap repay as a withdrawal', () =>
    expectPnl(pnlAt(after(3), { collateral: 21.4, debt: 23_763, oraclePrice: 2100 }), { pnl: 1177, roe: 5.885 }))

  it('counts plain collateral moves after the zap', () => {
    expectPnl(pnlAt(after(4), { collateral: 23.4, debt: 23_763, oraclePrice: 1900 }), { pnl: -3103, roe: -13.04 })
    expectPnl(pnlAt(after(5), { collateral: 20.4, debt: 23_763, oraclePrice: 2300 }), { pnl: 6257, roe: 37.02 })
  })
})

describe('liquidations', () => {
  const open = event({ collateralChange: 10, loanChange: 10_000, oraclePrice: 2000 })

  it('ignores a partial liquidation by another account', () => {
    const liquidated = event({
      collateralChange: -1,
      loanChange: -1000,
      oraclePrice: 1500,
      liquidation: { liquidator: LIQUIDATOR },
    })
    expect(toPositionCapital({ events: [open, liquidated] })).toEqual(toPositionCapital({ events: [open] }))
  })

  it('counts what a self-liquidation took from the wallet', () => {
    const selfLiquidated = event({
      oraclePrice: 1500,
      liquidation: {
        liquidator: USER.toUpperCase().replace('0X', '0x') as typeof USER,
        debt: 10_000,
        stablecoinReceived: 500,
        collateralReceived: 2,
      },
    })
    // 10,000 debt − 500 stablecoin − 2 × 1,500 collateral
    expect(Number(toPositionCapital({ events: [open, selfLiquidated] })?.debt.netInvested)).toBe(10_000 + 6500)
  })
})

describe('capital', () => {
  it('only counts events after the last closed position', () => {
    const closed = [
      event({ collateralChange: 5, loanChange: 1000, oraclePrice: 1000 }),
      event({ collateralChange: -5, loanChange: -1000, oraclePrice: 3000, isPositionClosed: true }),
    ]
    const open = event({ collateralChange: 10, loanChange: 10_000, oraclePrice: 2000 })
    expect(toPositionCapital({ events: [...closed, open] })).toEqual(toPositionCapital({ events: [open] }))
  })

  it('is null without events in the open position', () => {
    expect(toPositionCapital({ events: [] })).toBeNull()
    expect(
      toPositionCapital({ events: [event({ loanChange: -1000, oraclePrice: 2000, isPositionClosed: true })] }),
    ).toBeNull()
    expect(pnlAt([], { collateral: 10, debt: 10_000, oraclePrice: 2000 })).toBeNull()
  })

  it('has no collateral values when an event has no oracle price', () => {
    const events = [event({ collateralChange: 10, loanChange: 10_000, oraclePrice: 0 })]
    const pnl = pnlAt(events, { collateral: 10, debt: 10_000, oraclePrice: 2200 })
    expect(pnl?.collateral).toBeNull()
    // the deposit counts as worth 0: N = 10 × 0 − 10,000
    expect(Number(pnl?.debt.pnl)).toBe(12_000 + 10_000)
  })

  it('has no collateral values at a zero oracle price', () =>
    expect(
      pnlAt([event({ collateralChange: 10, loanChange: 10_000, oraclePrice: 2000 })], {
        collateral: 10,
        debt: 10_000,
        oraclePrice: 0,
      })?.collateral,
    ).toBeNull())
})

describe('ROE', () => {
  it('is null when own capital is not positive', () => {
    // removed more collateral value than deposited: N = 9,000 − 15,000, K = N + 1,000 = −5,000
    const events = [
      event({ collateralChange: 10, loanChange: 1000, oraclePrice: 1000 }),
      event({ collateralChange: -5, oraclePrice: 3000 }),
    ]
    expectPnl(pnlAt(events, { collateral: 5, debt: 1000, oraclePrice: 3000 }), {
      pnl: 20_000,
      roe: null,
      pnlC: 0.6667,
      roeC: 13.33,
    })
  })

  it('is null when the market has no ROE', () =>
    expectPnl(
      pnlAt([event({ collateralChange: 10, loanChange: 10_000, oraclePrice: 2000 })], {
        collateral: 10,
        debt: 10_000,
        oraclePrice: 2200,
        roeEnabled: false,
      }),
      { pnl: 2000, roe: null, pnlC: 0.4545, roeC: null },
    ))
})
