import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: [
      {
        label: POOL_TITLES[PoolColumnId.NetApy],
        columns: [PoolColumnId.NetApy],
        active: true,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.BaseApy],
        columns: [PoolColumnId.BaseApy],
        active: false,
        enabled: !isLite,
      },
      {
        label: POOL_TITLES[PoolColumnId.WeeklyBaseApy],
        columns: [PoolColumnId.WeeklyBaseApy],
        active: false,
        enabled: !isLite,
      },
      {
        label: POOL_TITLES[PoolColumnId.CrvApy],
        columns: [PoolColumnId.CrvApy],
        active: false,
        enabled: true,
      },
      {
        label: POOL_TITLES[PoolColumnId.RewardsApy],
        columns: [PoolColumnId.RewardsApy],
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
