import { getAddress } from 'viem'
import { usePoolLiquidityEvents } from '@/dex/entities/pool-liquidity.query'
import { usePoolContext } from '@/dex/features/pool-context'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import type { Chain } from '@curvefi/prices-api'
import type { PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { evmAddressDisplay, getPageCount } from '@evm-ui/utils'
import { scanTxPath } from '@legacy-ui/utils'
import type { Token } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { useCombinedQueries } from '@ui/features/queries/combine'
import { loadingQ } from '@ui/features/queries/util'
import { useActivityTable } from '@ui/features/tables/activity-table/hooks/useActivityTable'
import { useActivityVisibility } from '@ui/features/tables/activity-table/hooks/useActivityVisibility'
import { useManualPagination } from '@ui/features/tables/activity-table/hooks/useManualPagination'
import type { ActivityRow } from '@ui/features/tables/activity-table/types'
import { DEFAULT_PAGE_SIZE } from '@ui/features/tables/activity-table/utils'
import { t } from '@ui/lib/i18n'

export type PoolLiquidityRow = PoolLiquidityEvent & { chainId: number; blockchainId: Chain; poolTokens: Token[] }

export const toActivityRow = ({
  chainId,
  blockchainId,
  txHash,
  time: timestamp,
  provider: address,
  eventType,
  tokenAmounts,
  poolTokens,
}: PoolLiquidityRow): ActivityRow => {
  const isAdd = eventType === 'AddLiquidity'

  return {
    chainId,
    blockchainId,
    txHash,
    timestamp,
    address,
    action: isAdd ? { label: t`Add liquidity` } : { label: t`Remove liquidity` },
    valueUsd: null,
    deltas: tokenAmounts
      .map((amount, index) => ({
        label: isAdd ? t`Add` : t`Remove`,
        token: poolTokens[index],
        amount: isAdd ? amount : -amount,
      }))
      .filter(({ amount }) => amount !== 0),
  }
}

/** Create an ActivityTable for pool liquidity events. */
export const usePoolActivityLiquidityTable = () => {
  const { chainId, blockchainId, poolAddress, apiPool } = usePoolContext()
  const { isHydrated } = useCurve()
  const network = getPricesApiBlockchainId(blockchainId)
  const { pagination, onPaginationChange, apiPage } = useManualPagination()

  const columnVisibility = useActivityVisibility({ hasValue: false })

  const poolLiquidityEvents = usePoolLiquidityEvents({
    blockchainId: network,
    poolAddress,
    page: apiPage,
    perPage: DEFAULT_PAGE_SIZE,
  })
  const { data: liquidityData } = poolLiquidityEvents

  const pageCount = getPageCount(liquidityData?.count, DEFAULT_PAGE_SIZE)

  const query = useCombinedQueries(
    [poolLiquidityEvents, apiPool, loadingQ(isHydrated || undefined)],
    (liquidityData, { coins: poolTokens }) =>
      maybe(network, blockchainId =>
        liquidityData.events.map(event => toActivityRow({ ...event, chainId, blockchainId, poolTokens })),
      ),
  )

  const table = useActivityTable({
    meta: { addressDisplay: { ...evmAddressDisplay, formatAddress: getAddress, scanTxPath } },
    query,
    state: { columnVisibility, pagination },
    manualPagination: true,
    pageCount,
    onPaginationChange,
  })

  return {
    table,
    emptyState: { title: t`No liquidity data found.` },
    errorState: { title: t`Could not load liquidity data.` },
  }
}
