import { getAddress } from 'viem'
import { ROUTE } from '@/dex/constants'
import { getPath } from '@/dex/utils/utilsRouter'
import { PoolExpandedPanelActions as PoolExpandedPanelActionsUi } from '@ui/features/pool-list/components/PoolExpandedPanelActions'
import type { PoolRow } from '@ui/features/pool-list/types'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'

export const PoolExpandedPanelActions: ExpandedPanelComponent<PoolRow> = ({ row: { original: pool } }) => (
  <PoolExpandedPanelActionsUi
    poolAddress={pool.address}
    path={getPath({ network: pool.blockchainId }, `${ROUTE.PAGE_POOLS}/${pool.address}`)}
    formatAddress={getAddress}
  />
)
