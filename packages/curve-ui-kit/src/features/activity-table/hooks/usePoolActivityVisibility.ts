import { useMemo } from 'react'
import type { VisibilityState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { PoolLiquidityColumnId, getTokenAmountColumnId } from '../columns/pool-liquidity-columns'
import { PoolTradesColumnId } from '../columns/pool-trades-columns'
import type { Token } from '../types'

const createTradesMobileVisibility = (): VisibilityState => ({
  [PoolTradesColumnId.Bought]: true,
  [PoolTradesColumnId.Sold]: false,
  [PoolTradesColumnId.User]: false,
  [PoolTradesColumnId.Time]: true,
})

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
