import { PoolColumnId } from '@/dex/features/pool-list/columns'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import { t } from '@ui-kit/lib/i18n'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'

const createVisibility = ({
  isLite,
  isCrvRewardsEnabled,
}: {
  isLite: boolean
  isCrvRewardsEnabled: boolean
}): VisibilityGroup<PoolColumnId>[] => [
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
        columns: notFalsy(
          PoolColumnId.RewardsBase,
          isCrvRewardsEnabled && PoolColumnId.RewardsCrv,
          PoolColumnId.RewardsOther,
        ),
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
  fullWithCrvReward: createVisibility({ isCrvRewardsEnabled: true, isLite: false }),
  fullNoCrvReward: createVisibility({ isCrvRewardsEnabled: false, isLite: false }),
  liteWithCrvReward: createVisibility({ isCrvRewardsEnabled: true, isLite: true }),
  liteNoCrvReward: createVisibility({ isCrvRewardsEnabled: false, isLite: true }),
}
export type PoolColumnVariant = keyof typeof POOL_LIST_COLUMN_OPTIONS
