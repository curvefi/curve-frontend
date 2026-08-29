import { useMemo } from 'react'
import { t } from '@evm-ui/lib/i18n'
import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { usePoolTitles } from './column.titles'
import { PoolColumnId } from './columns.enum'

export type PoolColumnVariant = 'full' | 'lite'

const createVisibility = (
  { isLite }: { isLite: boolean },
  poolTitles: Record<PoolColumnId, string>,
): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: [
      {
        label: poolTitles[PoolColumnId.Tokens],
        columns: [PoolColumnId.Tokens],
        active: false,
        enabled: true,
      },
      {
        label: poolTitles[PoolColumnId.NetRate],
        columns: [PoolColumnId.NetRate],
        active: true,
        enabled: true,
      },
      {
        label: poolTitles[PoolColumnId.BaseRate],
        columns: [PoolColumnId.BaseRate],
        active: false,
        enabled: !isLite,
      },
      {
        label: poolTitles[PoolColumnId.WeeklyBaseRate],
        columns: [PoolColumnId.WeeklyBaseRate],
        active: false,
        enabled: !isLite,
      },
      {
        label: poolTitles[PoolColumnId.CrvRate],
        columns: [PoolColumnId.CrvRate],
        active: false,
        enabled: true,
      },
      {
        label: poolTitles[PoolColumnId.RewardsRate],
        columns: [PoolColumnId.RewardsRate],
        active: false,
        enabled: true,
      },

      {
        label: poolTitles[PoolColumnId.Points],
        columns: [PoolColumnId.Points],
        active: false,
        enabled: true,
      },
      {
        label: poolTitles[PoolColumnId.Volume],
        columns: [PoolColumnId.Volume],
        active: !isLite,
        enabled: !isLite,
      },
      {
        label: poolTitles[PoolColumnId.Tvl],
        columns: [PoolColumnId.Tvl],
        active: true,
        enabled: true,
      },
      {
        label: poolTitles[PoolColumnId.Age],
        columns: [PoolColumnId.Age],
        active: false,
        enabled: !isLite,
      },
    ],
  },
]

export const usePoolsColumnOptions = () => {
  const poolTitles = usePoolTitles()

  return useMemo(
    () => ({
      full: createVisibility({ isLite: false }, poolTitles),
      lite: createVisibility({ isLite: true }, poolTitles),
    }),
    [poolTitles],
  )
}

export const getDefaultPoolsSort = (isLite: boolean) => [
  { id: isLite ? PoolColumnId.Tvl : PoolColumnId.Volume, desc: true },
]
