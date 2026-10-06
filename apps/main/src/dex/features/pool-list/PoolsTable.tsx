import { useConnection } from 'wagmi'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import { usePoolsFilters } from '@ui/features/pool-list/hooks/usePoolsFilters'
import { usePoolsPagination } from '@ui/features/pool-list/hooks/usePoolsPagination'
import { usePoolsSorting } from '@ui/features/pool-list/hooks/usePoolsSorting'
import { PoolsTable as PoolsTableUi } from '@ui/features/pool-list/PoolsTable'
import type { PoolRow } from '@ui/features/pool-list/types'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { usePoolsTable } from './hooks/usePoolsTable'

export const PoolsTable = ({
  network,
  Actions,
}: {
  network: NetworkConfig
  Actions: ExpandedPanelComponent<PoolRow>
}) => {
  const { address, isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  const isLite = isLiteChain(network.chainId)
  const pagination = usePoolsPagination()
  const filters = usePoolsFilters()
  const sorting = usePoolsSorting(isLite, pagination.updateQueryAndResetPage)
  const data = usePoolsTable({
    filters: isLite ? {} : filters.apiParams,
    network,
    page: pagination.pagination.pageIndex + 1,
    searchText: filters.searchText,
    sortBy: sorting.sortBy,
    sortDirection: sorting.sortDirection,
  })

  return (
    <PoolsTableUi
      {...data}
      userAddress={address}
      isConnecting={isConnecting}
      isConnected={isConnected}
      connect={connect}
      isLite={isLite}
      filters={filters}
      pagination={pagination}
      sorting={sorting}
      addressDisplay={evmAddressDisplay}
      crvToken={{ address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.chain }}
      Actions={Actions}
    />
  )
}
