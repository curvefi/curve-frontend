import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { t } from '@ui/lib/i18n'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: [
      {
        label: POOL_TITLES[PoolColumnId.Tokens],
        columns: [PoolColumnId.Tokens],
        active: false,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.NetRate],
        columns: [PoolColumnId.NetRate],
        active: true,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.BaseRate],
        columns: [PoolColumnId.BaseRate],
        active: false,
        enabled: !isLite,
      },
      {
        label: POOL_TITLES[PoolColumnId.WeeklyBaseRate],
        columns: [PoolColumnId.WeeklyBaseRate],
        active: false,
        enabled: !isLite,
      },
      {
        label: POOL_TITLES[PoolColumnId.CrvRate],
        columns: [PoolColumnId.CrvRate],
        active: false,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.RewardsRate],
        columns: [PoolColumnId.RewardsRate],
        active: false,
        enabled: true,
      },

      {
        label: POOL_TITLES[PoolColumnId.Points],
        columns: [PoolColumnId.Points],
        active: false,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.Volume],
        columns: [PoolColumnId.Volume],
        active: !isLite,
        enabled: !isLite,
      },
      {
        label: POOL_TITLES[PoolColumnId.Tvl],
        columns: [PoolColumnId.Tvl],
        active: true,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.Age],
        columns: [PoolColumnId.Age],
        active: false,
        enabled: !isLite,
      },
    ],
  },
]

export const POOLS_COLUMN_OPTIONS = {
  full: createVisibility({ isLite: false }),
  lite: createVisibility({ isLite: true }),
}

export const getDefaultPoolsSort = (isLite: boolean) => [
  { id: isLite ? PoolColumnId.Tvl : PoolColumnId.Volume, desc: true },
]
