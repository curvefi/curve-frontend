import type { YieldBreakdownRow } from '@/dex/features/pool-information/components/yield-breakdown/columns/columns.definitions'
import { getBaseRateRow } from '@/dex/features/pool-information/hooks/useYieldBreakdown'
import { notFalsy } from '@primitives/objects.utils'

describe('Yield breakdown', () => {
  it('keeps reward rows and omits the base row when Prices API APR data is unavailable', () => {
    const rewardRow: YieldBreakdownRow = {
      source: { icon: null, iconPosition: 'left', primary: 'RWD' },
      rate: 5,
    }
    const baseRateRow = getBaseRateRow({ baseDailyRate: null, baseWeeklyRate: null, rateDisplay: 'apy' })
    const rows = [rewardRow, ...notFalsy(baseRateRow)]

    expect(rows).to.deep.equal([rewardRow])
  })
})
