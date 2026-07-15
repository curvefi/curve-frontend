import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { LegacyPoolColumnId } from './legacy-columns.enum'

const createVisibility = ({ isLite }: { isLite: boolean }): VisibilityGroup<LegacyPoolColumnId>[] => [
  {
    label: t`Pools`,
    options: [
      {
        label: t`Pool`,
        columns: [LegacyPoolColumnId.PoolName],
        active: true,
        enabled: true,
      },
      {
        label: t`Rewards Base`,
        columns: [LegacyPoolColumnId.RewardsBase],
        active: !isLite,
        enabled: true,
      },
      {
        label: t`Rewards Other`,
        columns: [LegacyPoolColumnId.RewardsOther],
        active: true,
        enabled: true,
      },
      {
        label: t`Volume`,
        columns: [LegacyPoolColumnId.Volume],
        active: !isLite,
        enabled: true,
      },
      {
        label: t`TVL`,
        columns: [LegacyPoolColumnId.Tvl],
        active: true,
        enabled: true,
      },
    ],
  },
]

export const LEGACY_POOLS_COLUMN_OPTIONS = {
  full: createVisibility({ isLite: false }),
  lite: createVisibility({ isLite: true }),
}
export const getDefaultLegacyPoolsSort = (isLite: boolean) => [
  { id: isLite ? LegacyPoolColumnId.Tvl : LegacyPoolColumnId.Volume, desc: true },
]
