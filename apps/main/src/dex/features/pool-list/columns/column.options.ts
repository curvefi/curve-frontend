import { fromEntries, recordValues } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { PoolListColumnId } from './column.enum'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<PoolListColumnId>[] => [
  {
    label: t`Markets`,
    options: [
      {
        label: t`Pool`,
        columns: [PoolListColumnId.PoolName],
        active: true,
        enabled: true,
      },
      {
        label: t`Rewards Base`,
        columns: [PoolListColumnId.RewardsBase],
        active: !isLite,
        enabled: true,
      },
      {
        label: t`Rewards Other`,
        columns: [PoolListColumnId.RewardsOther],
        active: true,
        enabled: true,
      },
      {
        label: t`Volume`,
        columns: [PoolListColumnId.Volume],
        active: !isLite,
        enabled: true,
      },
      {
        label: t`TVL`,
        columns: [PoolListColumnId.Tvl],
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

export type PoolListColumnVariant = keyof typeof POOL_LIST_COLUMN_OPTIONS

export const getDefaultSort = (isLite: boolean) => [
  { id: isLite ? PoolListColumnId.Tvl : PoolListColumnId.Volume, desc: true },
]

export const createPoolListMobileColumns = (sortBy: PoolListColumnId) =>
  fromEntries(
    recordValues(PoolListColumnId).map(key => [key, key === PoolListColumnId.PoolName || key === sortBy]),
  )
