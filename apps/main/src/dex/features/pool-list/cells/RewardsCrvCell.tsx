import PoolRewardsCrv from '@/dex/components/PoolRewardsCrv'
import { RewardsApy } from '@/dex/types/main.types'
import type { CellContext } from '@tanstack/react-table'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { PoolListItem } from '../types'

export const RewardsCrvCell = ({
  row: { original: poolData },
  column,
  table,
}: CellContext<PoolListItem, RewardsApy['crv']>) => (
  <PoolRewardsCrv poolData={poolData} rewardsApy={poolData.rewards} isHighlight={isSortedBy(table, column)} />
)
