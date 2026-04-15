import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PoolColumnId } from '../columns'
import type { PoolListItem } from '../types'

type Prop = CellContext<PoolListItem, RewardsApy | undefined>

export const RewardsCrvCell = ({ getValue, table, row: { original: poolData } }: Prop) => {
  const rewards = getValue()
  const { crv } = rewards ?? {}
  return (
    crv && (
      <PoolRewardsCrv
        poolData={poolData}
        rewardsApy={rewards}
        isHighlight={isSortedBy(table, PoolColumnId.RewardsCrv)}
      />
    )
  )
}
