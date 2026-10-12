import { asAddress, formatAddress, stellarAddressDisplay } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolList } from '@/stellar/features/pool-list/usePoolList'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
import { PoolExpandedPanelActions } from '@ui/features/pool-list/components/PoolExpandedPanelActions'
import { usePoolsFilters } from '@ui/features/pool-list/hooks/usePoolsFilters'
import { usePoolsPagination } from '@ui/features/pool-list/hooks/usePoolsPagination'
import { usePoolsSorting } from '@ui/features/pool-list/hooks/usePoolsSorting'
import { PoolsTable } from '@ui/features/pool-list/PoolsTable'
import type { PoolAlerts, PoolRow } from '@ui/features/pool-list/types'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useParams } from '@ui/hooks/router'

const NO_ALERTS: PoolAlerts = { pools: {}, tokens: {}, vyper: { alertType: '' } }

const PoolActions: ExpandedPanelComponent<PoolRow> = ({ row: { original: pool } }) => (
  <PoolExpandedPanelActions poolAddress={pool.address} path={pool.url} formatAddress={formatAddress} />
)

export const PoolListPage = () => {
  const { network } = useParams<NetworkQuery>()
  const { address, connect, isConnected, isConnecting } = useWallet()
  const { isLite } = STELLAR_NETWORKS[network]
  const pagination = usePoolsPagination()
  const { isFetching, refetch, pageCount, query } = usePoolList({ network })
  return (
    <ListPageLayout>
      <PoolsTable
        tableQuery={query}
        isFetching={isFetching}
        onReload={refetch}
        pageCount={pageCount}
        userHasPositions={undefined}
        alerts={NO_ALERTS}
        isLite={isLite}
        filters={usePoolsFilters()}
        pagination={pagination}
        sorting={usePoolsSorting(isLite, pagination.updateQueryAndResetPage)}
        addressDisplay={stellarAddressDisplay}
        Actions={PoolActions}
        userAddress={asAddress(address)}
        connect={connect}
        isConnected={isConnected}
        isConnecting={isConnecting}
      />
    </ListPageLayout>
  )
}
