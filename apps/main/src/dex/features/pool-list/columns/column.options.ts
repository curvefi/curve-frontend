import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { PoolColumnId } from './columns.enum'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: [
      {
        label: t`Net APY`,
        columns: [PoolColumnId.NetApy],
        active: !isLite,
        enabled: !isLite,
      },
      {
        label: t`Base APY`,
        columns: [PoolColumnId.BaseApy],
        active: false,
        enabled: !isLite,
      },
      {
        label: t`Weekly Base APY`,
        columns: [PoolColumnId.WeeklyBaseApy],
        active: false,
        enabled: !isLite,
      },
      {
        label: t`Rewards APY`,
        columns: [PoolColumnId.RewardsApy],
        active: false,
        enabled: true,
      },
      {
        label: t`Gauge APY`,
        columns: [PoolColumnId.GaugeApy],
        active: false,
        enabled: !isLite,
      },
      {
        label: t`Points`,
        columns: [PoolColumnId.Points],
        active: false,
        enabled: true,
      },
      {
        label: t`1D vol`,
        columns: [PoolColumnId.Volume],
        active: true,
        enabled: true,
      },
      {
        label: t`TVL`,
        columns: [PoolColumnId.Tvl],
        active: true,
        enabled: true,
      },
      {
        label: t`Age`,
        columns: [PoolColumnId.Age],
        active: false,
        enabled: true,
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
