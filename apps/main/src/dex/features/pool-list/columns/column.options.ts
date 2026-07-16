import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { PoolColumnId } from './columns.enum'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: [
      {
        label: t`Rewards Base`,
        columns: [PoolColumnId.RewardsBase],
        active: !isLite,
        enabled: true,
      },
      {
        label: t`Rewards Other`,
        columns: [PoolColumnId.RewardsOther],
        active: true,
        enabled: true,
      },
      {
        label: t`Volume`,
        columns: [PoolColumnId.Volume],
        active: !isLite,
        enabled: true,
      },
      {
        label: t`TVL`,
        columns: [PoolColumnId.Tvl],
        active: true,
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
