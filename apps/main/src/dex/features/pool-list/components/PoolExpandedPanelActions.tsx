import { getAddress } from 'viem'
import { ROUTE } from '@/dex/constants'
import { PoolExpandedPanelActions as PoolExpandedPanelActionsUi } from '@ui/features/pool-list/components/PoolExpandedPanelActions'
import type { PoolRow } from '@ui/features/pool-list/types'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'

export const PoolExpandedPanelActions: ExpandedPanelComponent<PoolRow> = ({ row: { original: pool } }) => (
  <PoolExpandedPanelActionsUi
    poolAddress={pool.address}
    path={ROUTE.PAGE_POOL({ app: 'dex', blockchainId: pool.blockchainId, poolAddress: pool.address })}
    formatAddress={getAddress}
  />
)
