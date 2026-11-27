import { getAddress } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolTrades } from '@/dex/entities/pool-trades.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId, type Chain } from '@curvefi/prices-api'
import type { AllPoolTrade } from '@curvefi/prices-api/pools'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { evmAddressDisplay, getPageCount } from '@evm-ui/utils'
import { scanTxPath } from '@legacy-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useActivityTable } from '@ui/features/tables/activity-table/hooks/useActivityTable'
import { useActivityVisibility } from '@ui/features/tables/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@ui/features/tables/activity-table/hooks/useManualPagination'
import type { ActivityRow } from '@ui/features/tables/activity-table/types'
import { DEFAULT_PAGE_SIZE, getSwapDeltas } from '@ui/features/tables/activity-table/utils'
import { t } from '@ui/lib/i18n'

export type PoolSwapRow = AllPoolTrade & { chainId: number; blockchainId: Chain }

export const toActivityRow = ({
  chainId,
  blockchainId,
  txHash,
  time: timestamp,
  buyer: address,
  tokensSold,
  tokensSoldUsd,
  tokenSold,
  tokensBought,
  tokensBoughtUsd,
  tokenBought,
}: PoolSwapRow): ActivityRow => ({
  chainId,
  blockchainId,
  txHash,
  timestamp,
  address,
  action: { label: t`Swap` },
  valueUsd: maybe(tokensBoughtUsd, Math.abs) ?? null,
  deltas: getSwapDeltas(
    { token: tokenSold, amount: tokensSold, amountUsd: maybe(tokensSoldUsd, usd => (usd > 0 ? -usd : usd)) ?? null },
    { token: tokenBought, amount: tokensBought, amountUsd: tokensBoughtUsd },
  ),
})

/** Create an ActivityTable for pool swap events. */
export const usePoolActivitySwapsTable = () => {
  const { chainId, poolAddress } = usePoolContext()
  const { data: networkConfig } = useNetworkByChain({ chainId })
  const network = getPricesApiBlockchainId(networkConfig?.blockchainId)
  const { isHydrated } = useCurve()
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const columnVisibility = useActivityVisibility({ hasValue: true })

  const poolTrades = usePoolTrades({ blockchainId: network, poolAddress, page: apiPage, perPage: DEFAULT_PAGE_SIZE })
  const { data: tradesData } = poolTrades

  const pageCount = getPageCount(tradesData?.count, DEFAULT_PAGE_SIZE)

  const query = useCombinedQueries([poolTrades, loadingQ(isHydrated || undefined)], tradesData =>
    maybe(network, blockchainId => tradesData.trades.map(trade => toActivityRow({ ...trade, chainId, blockchainId }))),
  )

  const table = useActivityTable({
    meta: { addressDisplay: { ...evmAddressDisplay, formatAddress: getAddress, scanTxPath } },
    query,
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return { table, emptyState: { title: t`No swap data found.` }, errorState: { title: t`Could not load swap data.` } }
}
