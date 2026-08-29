import { describe, expect, it } from 'vitest'
import { getBorrowRateMetrics, getSupplyRateMetrics } from '@/llamalend/rates.utils'
import { maybe } from '@primitives/objects.utils'

describe('rate metrics', () => {
  it('converts independent supply APR components before summing them', () => {
    function convertRate(rate: number): number
    function convertRate(rate: number | null | undefined): number | null
    function convertRate(rate: number | null | undefined) {
      return maybe(rate, value => value ** 2) ?? null
    }

    expect(
      getSupplyRateMetrics({
        supplyApr: 1,
        crvBoostApr: [6, 7],
        rebasingYieldApr: 2,
        extraIncentivesApr: [3, 4],
        campaignsApr: [5],
        userSupplyBoost: '2',
        convertRate,
      }),
    ).toMatchObject({
      supplyRate: 1,
      supplyRateCrvMinBoost: 36,
      supplyRateCrvMaxBoost: 49,
      userBoostRate: 144,
      rebasingYieldRate: 4,
      extraIncentivesTotalRate: 25,
      totalMinBoost: 91,
      totalMaxBoost: 104,
      totalUserBoost: 199,
    })
  })

  it('keeps borrow metrics in APR', () => {
    expect(
      getBorrowRateMetrics({
        borrowRate: 10,
        campaignsRate: 1,
        snapshots: [{ timestamp: Date.now(), borrowApr: 10, rebasingYieldApr: 2 }],
        getBorrowRate: snapshot => snapshot.borrowApr,
        getRebasingYieldApr: snapshot => snapshot.rebasingYieldApr,
        daysBack: 7,
      }),
    ).toMatchObject({
      rebasingYieldApr: 2,
      totalRate: 7,
      averageRate: 10,
      averageRebasingYieldApr: 2,
      averageTotalRate: 8,
    })
  })
})
