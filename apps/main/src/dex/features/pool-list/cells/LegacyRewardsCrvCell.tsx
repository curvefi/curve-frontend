import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LegacyPoolColumnId } from '../columns'
import { hasLegacyCrvRewards } from '../hooks/useLegacyHasPoolRewards'
import type { LegacyPoolListItem } from '../legacy-pools.types'
import { Placeholder } from './Placeholder'

type Prop = CellContext<LegacyPoolListItem, RewardsApy | undefined> & { placeholder?: boolean }

export const LegacyRewardsCrvCell = ({ getValue, table, row: { original: poolData }, placeholder = true }: Prop) => {
  const rewards = getValue()
  return hasLegacyCrvRewards(rewards) ? (
    <PoolRewardsCrv
      poolData={poolData}
      rewardsApy={rewards}
      isHighlight={isSortedBy(table, LegacyPoolColumnId.RewardsCrv)}
    />
  ) : placeholder ? (
    <Placeholder />
  ) : null
}
