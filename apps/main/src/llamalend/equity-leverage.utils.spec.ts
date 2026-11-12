import { describe, expect, it } from 'vitest'
import type { Decimal } from '@primitives/decimal.utils'
import { getCarryApr, type MarketYields } from './equity-leverage.utils'

/** 10 collateral at an oracle price of 1 against 5 debt: 5 equity */
const POSITION = { collateral: '10' as Decimal, convertedBorrowed: '0' as Decimal, debt: '5' as Decimal }

/** 6% on the collateral, no borrowed-token yield nor borrow rewards */
const YIELDS: MarketYields = { collateralYieldApr: '6', borrowedYieldApr: '0', borrowRewardsApr: '0' }

const getCarry = ({
  position = POSITION,
  borrowApr = '3',
  yields = {},
}: { position?: typeof POSITION; borrowApr?: Decimal; yields?: Partial<MarketYields> } = {}) =>
  getCarryApr(position, '1', borrowApr, { ...YIELDS, ...yields })

describe('getCarryApr', () => {
  it('earns the collateral yield on the equity after the borrow interest', () =>
    // (10 × 6% − 5 × 3%) / 5
    expect(Number(getCarry())).toBeCloseTo(9))

  it('removes the borrow rewards from the borrow interest', () =>
    // (10 × 6% − 5 × (3% − 1%)) / 5
    expect(Number(getCarry({ yields: { borrowRewardsApr: '1' } }))).toBeCloseTo(10))

  it('pays the borrowed-token yield on the debt', () =>
    // (10 × 6% − 5 × 3% − 5 × 2%) / 5
    expect(Number(getCarry({ yields: { borrowedYieldApr: '2' } }))).toBeCloseTo(7))

  it('earns the borrowed-token yield back on the tokens converted in soft liquidation', () =>
    // 8 collateral + 2 converted − 5 debt = 5 equity: (8 × 6% − 5 × 3% − (5 − 2) × 2%) / 5
    expect(
      Number(
        getCarry({
          position: { collateral: '8', convertedBorrowed: '2', debt: '5' },
          yields: { borrowedYieldApr: '2' },
        }),
      ),
    ).toBeCloseTo(5.4))

  it.each([null, '0'])('is null with a collateral yield of %s', collateralYieldApr =>
    expect(getCarry({ yields: { collateralYieldApr } })).toBeNull(),
  )

  it('is null without equity', () => expect(getCarry({ position: { ...POSITION, debt: '10' } })).toBeNull())
})
