import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PoolColumnId } from '../columns'
import { hasCrvRewards } from '../hooks/useHasPoolRewards'
import type { PoolListItem } from '../types'
import { Placeholder } from './Placeholder'

type Prop = CellContext<PoolListItem, RewardsApy | undefined> & { placeholder?: boolean }

export const RewardsCrvCell = ({ getValue, table, row: { original: poolData }, placeholder = true }: Prop) => {
  const rewards = getValue()
  return hasCrvRewards(rewards) ? (
    <PoolRewardsCrv poolData={poolData} rewardsApy={rewards} isHighlight={isSortedBy(table, PoolColumnId.RewardsCrv)} />
  ) : placeholder ? (
    <Placeholder />
  ) : null
}
