import { useMemo } from 'react'
import type { VisibilityState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { PoolLiquidityColumnId, getTokenAmountColumnId } from '../columns/pool-liquidity-columns'
import { PoolTradesColumnId } from '../columns/pool-trades-columns'
import type { Token } from '../types'

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
 * Hides all token amount columns.
 */
const createLiquidityMobileVisibility = (poolTokens: Token[]): VisibilityState => {
  const visibility: VisibilityState = {
    [PoolLiquidityColumnId.Action]: true,
    [PoolLiquidityColumnId.User]: false,
    [PoolLiquidityColumnId.Time]: true,
  }

  // Hide all token amount columns on mobile
  poolTokens.forEach((_, index) => {
    visibility[getTokenAmountColumnId(index)] = false
  })

  return visibility
}

type UsePoolActivityVisibilityParams = {
  /** Pool tokens in order matching tokenAmounts array */
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
