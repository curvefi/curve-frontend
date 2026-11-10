import { useMemo } from 'react'
import type { ColumnVisibilityState } from '@tanstack/react-table'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { PoolLiquidityColumnId } from '../columns/pool-liquidity-columns'
import { PoolTradesColumnId } from '../columns/pool-trades-columns'

const createTradesMobileVisibility = (): ColumnVisibilityState => ({
  [PoolTradesColumnId.User]: true,
  [PoolTradesColumnId.Bought]: true,
  [PoolTradesColumnId.Sold]: false,
  [PoolTradesColumnId.Time]: false,
})

const createLiquidityMobileVisibility = (): ColumnVisibilityState => ({
  [PoolLiquidityColumnId.User]: true,
  [PoolLiquidityColumnId.Action]: true,
  [PoolLiquidityColumnId.TokenAmount]: false,
  [PoolLiquidityColumnId.Time]: false,
})

/**
 * Hook to manage column visibility for the pool activity tables.
 * On mobile, only shows key columns with the rest available in the expanded row.
 */
export const usePoolActivityVisibility = () => {
  const isMobile = useIsMobile()
  const tradesColumnVisibility = useMemo(() => (isMobile ? createTradesMobileVisibility() : undefined), [isMobile])
  const liquidityColumnVisibility = useMemo(
    () => (isMobile ? createLiquidityMobileVisibility() : undefined),
    [isMobile],
  )

  return { tradesColumnVisibility, liquidityColumnVisibility }
}
