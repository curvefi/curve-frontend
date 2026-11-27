import { useState } from 'react'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolContext } from '@/dex/features/pool-context'
import type { Chain } from '@curvefi/prices-api'
import { type TimeOption, timeOptions } from '@evm-ui/queries/validation/time-option-validation'
import { maybe } from '@primitives/objects.utils'
import { PoolHistoricalBaseRateChart as HistoricalBaseRateChart } from '@ui/features/pools/PoolHistoricalBaseRateChart'
import { mapQuery } from '@ui/features/queries/util'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { TIME_OPTION_MS } from '@ui/lib/time'

export const PoolHistoricalBaseRateChart = () => {
  const { blockchainId, poolAddress, apiPool, userAddress } = usePoolContext()
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const end = Math.floor(useCurrentDate('15m').getTime() / 1000)
  const snapshots = usePoolSnapshots({
    blockchainId: blockchainId as Chain,
    poolAddress,
    start: end - TIME_OPTION_MS[timeOption] / 1000,
    end,
    unit: 'day',
  })

  return (
    <HistoricalBaseRateChart
      ratePoints={mapQuery(snapshots, snapshots =>
        snapshots
          .toReversed()
          .map(snapshot => ({
            timestamp: snapshot.timestamp,
            dailyBaseRate: maybe(snapshot.baseDailyApr, apr => apr * 100) ?? undefined,
            weeklyBaseRate: maybe(snapshot.baseWeeklyApr, apr => apr * 100) ?? undefined,
          })),
      )}
      dailyBaseRate={mapQuery(apiPool, pool => pool.baseDailyApr)}
      weeklyBaseRate={mapQuery(apiPool, pool => pool.baseWeeklyApr)}
      timeOption={{ options: timeOptions, activeOption: timeOption, setActiveOption: setTimeOption }}
      userAddress={userAddress}
    />
  )
}
