import type { ReactNode } from 'react'
import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PoolColumnId } from '../columns'
import { hasCrvRewards } from '../hooks/useHasPoolRewards'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy | undefined> & { placeholder?: ReactNode }

export const RewardsCrvCell = ({ getValue, table, row: { original: poolData }, placeholder = '-' }: Prop) => {
  const rewards = getValue()
  return hasCrvRewards(rewards) ? (
    <PoolRewardsCrv poolData={poolData} rewardsApy={rewards} isHighlight={isSortedBy(table, PoolColumnId.RewardsCrv)} />
  ) : (
    placeholder
  )
}
