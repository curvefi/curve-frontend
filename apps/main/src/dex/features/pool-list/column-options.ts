import { notFalsy } from '@curvefi/prices-api/objects.util'
import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { PoolColumnId } from './columns'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Markets`,
    options: [
      {
        label: t`Pool`,
        columns: [PoolColumnId.PoolName],
        active: true,
        enabled: true,
      },
      {
        label: t`Rewards`,
        columns: notFalsy(PoolColumnId.RewardsBase, PoolColumnId.RewardsOther),
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

export const POOL_LIST_COLUMN_OPTIONS = {
  full: createVisibility({ isLite: false }),
  lite: createVisibility({ isLite: true }),
}
export type PoolColumnVariant = keyof typeof POOL_LIST_COLUMN_OPTIONS
