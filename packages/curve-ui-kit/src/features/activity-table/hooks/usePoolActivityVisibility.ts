import { useMemo } from 'react'
import type { VisibilityState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { PoolLiquidityColumnId } from '../columns/pool-liquidity-columns'
import { PoolTradesColumnId } from '../columns/pool-trades-columns'

/**
 * Create mobile column visibility for pool trades table.
 * On mobile, shows only Bought and Time columns.
 */
const createTradesMobileVisibility = (): VisibilityState => ({
  [PoolTradesColumnId.Bought]: true,
  [PoolTradesColumnId.Sold]: false,
  [PoolTradesColumnId.User]: false,
  [PoolTradesColumnId.Time]: true,
})

/**
 * Create mobile column visibility for pool liquidity table.
 * On mobile, shows only Action and Time columns.
 */
const createLiquidityMobileVisibility = (): VisibilityState => ({
  [PoolLiquidityColumnId.Action]: true,
  [PoolLiquidityColumnId.Amounts]: false,
  [PoolLiquidityColumnId.User]: false,
  [PoolLiquidityColumnId.Time]: true,
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
