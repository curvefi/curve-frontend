import type { CellContext } from '@tanstack/react-table'
import type { PoolListItem } from '../poolList.types'
import { PoolListRewards } from './PoolListRewards'

export const PoolListRewardsCell = ({ row }: CellContext<PoolListItem, unknown>) => (
  <PoolListRewards pool={row.original} />
)
