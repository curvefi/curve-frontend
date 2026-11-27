import { getAddress } from 'viem'
import { useMarketContext } from '@/llamalend/features/market-context'
import { getActivityToken } from '@/llamalend/llama.utils'
import { useMarketSupplyEvents } from '@/llamalend/queries/market/market-supply-events.query'
import type { VaultEvent } from '@curvefi/prices-api/llamalend'
import { evmAddressDisplay, getPageCount } from '@evm-ui/utils'
import { scanTxPath } from '@legacy-ui/utils'
import { mapQuery } from '@ui/features/queries/util'
import { useActivityTable } from '@ui/features/tables/activity-table/hooks/useActivityTable'
import { useActivityVisibility } from '@ui/features/tables/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@ui/features/tables/activity-table/hooks/useManualPagination'
import type { ActivityRow, ActivityToken } from '@ui/features/tables/activity-table/types'
import { DEFAULT_PAGE_SIZE } from '@ui/features/tables/activity-table/utils'
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
  const action: ActivityRow['action'] = { label: deposit ? t`Deposit` : withdrawal ? t`Withdrawal` : '' }

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
  const { userAddress } = useMarketContext()
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
      meta: { addressDisplay: { ...evmAddressDisplay, formatAddress: getAddress, scanTxPath }, userAddress },
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
