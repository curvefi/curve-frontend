import { getActivityToken } from '@/llamalend/llama.utils'
import { useMarketSupplyEvents } from '@/llamalend/queries/market/market-supply-events.query'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import { useActivityTable } from '@evm-ui/features/activity-table/hooks/useActivityTable'
import { useActivityVisibility } from '@evm-ui/features/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@evm-ui/features/activity-table/hooks/useManualPagination'
import type { ActivityRow, ActivityToken } from '@evm-ui/features/activity-table/types'
import { DEFAULT_PAGE_SIZE } from '@evm-ui/features/activity-table/utils'
import { getPageCount } from '@evm-ui/utils'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { MarketSupplyActivityProps } from '../types'

export type MarketSupplyEventRow = VaultEvent &
  Pick<MarketSupplyActivityProps, 'chainId' | 'blockchainId'> & {
    borrowToken: ActivityToken | undefined
    vaultToken: ActivityToken | undefined
  }

export const toActivityRow = ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  provider: address,
  deposit,
  withdrawal,
  borrowToken,
  vaultToken,
}: MarketSupplyEventRow): ActivityRow => {
  const amounts = deposit ?? withdrawal
  const assetSign = deposit ? -1 : 1
  const action: ActivityRow['action'] = deposit
    ? { label: t`Deposit`, color: 'success' }
    : withdrawal
      ? { label: t`Withdrawal`, color: 'error' }
      : { label: '' }

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action,
    valueUsd: null,
    deltas: amounts
      ? [
          { label: t`Assets`, token: borrowToken, amount: assetSign * amounts.assets },
          { label: t`Shares`, token: vaultToken, amount: -assetSign * amounts.shares },
        ]
      : [],
  }
}

export const useMarketActivitySupplyEventsTable = ({
  chainId,
  blockchainId,
  borrowToken,
  vaultToken,
}: MarketSupplyActivityProps) => {
  const columnVisibility = useActivityVisibility({ hasValue: false })
  const { pagination, onPaginationChange, apiPage: page } = useManualPagination()
  const eventsQuery = useMarketSupplyEvents({
    blockchainId,
    contractAddress: vaultToken?.address,
    page,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const query = mapQuery(eventsQuery, ({ events }) => {
    const assets = getActivityToken(blockchainId, borrowToken)
    const shares = getActivityToken(blockchainId, vaultToken)
    return events.map(event =>
      toActivityRow({ ...event, chainId, blockchainId, borrowToken: assets, vaultToken: shares }),
    )
  })

  return {
    table: useActivityTable({
      query,
      state: { columnVisibility, pagination },
      manualPagination: true,
      pageCount: getPageCount(eventsQuery.data?.count, DEFAULT_PAGE_SIZE),
      onPaginationChange,
    }),
    emptyState: { title: t`No activity data found.` },
    errorState: { title: t`Could not load activity data.` },
  }
}
