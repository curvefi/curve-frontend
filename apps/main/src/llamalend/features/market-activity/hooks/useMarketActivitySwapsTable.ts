import { getAddress } from 'viem'
import { getActivityToken } from '@/llamalend/llama.utils'
import { useLlammaTrades } from '@/llamalend/queries/llamma-trades.query'
import type { Chain } from '@curvefi/prices-api'
import type { LlammaTrade } from '@curvefi/prices-api/llamma'
import { evmAddressDisplay, getPageCount } from '@evm-ui/utils'
import { scanTxPath } from '@legacy-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useActivityTable } from '@ui/features/tables/activity-table/hooks/useActivityTable'
import { useActivityVisibility } from '@ui/features/tables/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@ui/features/tables/activity-table/hooks/useManualPagination'
import type { ActivityRow, ActivityToken } from '@ui/features/tables/activity-table/types'
import { DEFAULT_PAGE_SIZE, getSwapDeltas } from '@ui/features/tables/activity-table/utils'
import { t } from '@ui/lib/i18n'
import type { MarketBorrowActivityProps } from '../types'

export type MarketSwapRow = Omit<LlammaTrade, 'tokenBought' | 'tokenSold'> & {
  chainId: number
  blockchainId: Chain
  tokenBought: ActivityToken
  tokenSold: ActivityToken
}

export const toActivityRow = ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  buyer: address,
  amountSold,
  tokenSold,
  amountBought,
  tokenBought,
}: MarketSwapRow): ActivityRow => ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  address,
  action: { label: t`Swap` },
  valueUsd: null,
  deltas: getSwapDeltas({ token: tokenSold, amount: amountSold }, { token: tokenBought, amount: amountBought }),
})

export const useMarketActivitySwapsTable = ({
  chainId,
  blockchainId,
  ammAddress,
  endpoint,
}: MarketBorrowActivityProps) => {
  const columnVisibility = useActivityVisibility({ hasValue: false })
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const tradesQuery = useLlammaTrades({
    blockchainId,
    llamma: ammAddress,
    endpoint,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })

  const pageCount = getPageCount(tradesQuery.data?.count, DEFAULT_PAGE_SIZE)

  const activityQuery = mapQuery(tradesQuery, ({ trades }) =>
    maybe(blockchainId, blockchainId =>
      trades.map(trade =>
        toActivityRow({
          ...trade,
          chainId,
          blockchainId,
          tokenBought: getActivityToken(blockchainId, trade.tokenBought) ?? trade.tokenBought,
          tokenSold: getActivityToken(blockchainId, trade.tokenSold) ?? trade.tokenSold,
        }),
      ),
    ),
  )

  const table = useActivityTable({
    meta: { addressDisplay: { ...evmAddressDisplay, formatAddress: getAddress, scanTxPath } },
    query: q({
      data: activityQuery.data,
      isLoading: activityQuery.isLoading || !ammAddress,
      error: ammAddress ? activityQuery.error : null,
    }),
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return { table, emptyState: { title: t`No swap data found.` }, errorState: { title: t`Could not load swap data.` } }
}
