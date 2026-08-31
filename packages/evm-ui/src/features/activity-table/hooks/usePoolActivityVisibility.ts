import { useMemo } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { type Token } from '@primitives/address.utils'
import { fromEntries } from '@primitives/objects.utils'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import { getTokenAmountColumnId, PoolLiquidityColumnId } from '../columns/pool-liquidity-columns'
import { PoolTradesColumnId } from '../columns/pool-trades-columns'

const createTradesMobileVisibility = (): ColumnVisibilityState => ({
  [PoolTradesColumnId.User]: true,
  [PoolTradesColumnId.Bought]: true,
  [PoolTradesColumnId.Sold]: false,
  [PoolTradesColumnId.Time]: false,
})

const createLiquidityMobileVisibility = (poolTokens: Token[]): ColumnVisibilityState => ({
  [PoolLiquidityColumnId.User]: true,
  [PoolLiquidityColumnId.Action]: true,
  [PoolLiquidityColumnId.Time]: false,
  // Hide all token amount columns on mobile
  ...fromEntries(poolTokens.map((_, index) => [getTokenAmountColumnId(index), false])),
})

type UsePoolActivityVisibilityParams = {
  poolTokens: Token[]
}

/**
 * Hook to manage column visibility for the pool activity tables.
 * On mobile, only shows key columns with the rest available in the expanded row.
 */
export const usePoolActivityVisibility = ({ poolTokens }: UsePoolActivityVisibilityParams) => {
  const isMobile = useIsMobile()
  const tradesColumnVisibility = useMemo(() => (isMobile ? createTradesMobileVisibility() : undefined), [isMobile])
  const liquidityColumnVisibility = useMemo(
    () => (isMobile ? createLiquidityMobileVisibility(poolTokens) : undefined),
    [isMobile, poolTokens],
  )

  return { tradesColumnVisibility, liquidityColumnVisibility }
}
