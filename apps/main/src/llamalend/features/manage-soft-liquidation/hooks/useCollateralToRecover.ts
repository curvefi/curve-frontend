import { useConnection } from 'wagmi'
import { getLlamaMarket, getTokens } from '@/llamalend/llama.utils'
import { useUserState } from '@/llamalend/queries/user'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { decimal } from '@ui-kit/utils'
import type { ClosePositionProps } from '..'
import type { MarketParams } from '../types'

/**
 * Calculates the recoverable collateral and stablecoin when closing a position in soft liquidation
 *
 * This hook determines what assets a user can recover when closing their position:
 * 1. Any remaining collateral tokens (if collateral > 0)
 * 2. Excess stablecoin tokens (if stablecoin balance > outstanding debt)
 *
 * @returns Array of recoverable token objects with symbol, address, amount, and USD value
 */
export function useCollateralToRecover({ chainId, marketId }: MarketParams): ClosePositionProps['collateralToRecover'] {
  const { address: userAddress } = useConnection()
  const { data: userState } = useUserState({ chainId, marketId, userAddress })
  const { collateral, debt, stablecoin } = userState ?? {}

  // Get market tokens
  const market = getLlamaMarket(marketId)
  const tokens = market && getTokens(market)

  // Fetch USD rates for tokens
  const { data: stablecoinUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokens?.borrowToken?.address },
    !!tokens?.borrowToken?.address,
  )

  const { data: collateralTokenUsdRate } = useTokenUsdRate(
    { chainId, tokenAddress: tokens?.collateralToken?.address },
    !!tokens?.collateralToken?.address,
  )

  const stablecoinToken = { ...tokens.borrowToken, usdRate: stablecoinUsdRate }
  const collateralToken = { ...tokens.collateralToken, usdRate: collateralTokenUsdRate }

  const excessStablecoin = (stablecoin && debt && +stablecoin - +debt) || 0

  return [
    // Add collateral tokens if user has any remaining after position closure
    ...(collateral && +collateral > 0
      ? [
          {
            symbol: collateralToken.symbol,
            address: collateralToken.address,
            amount: collateral,
            usd: +collateral * (collateralToken.usdRate ?? 0),
          },
        ]
      : []),
    // Add excess stablecoin (stablecoin balance minus outstanding debt) if positive
    ...(excessStablecoin > 0
      ? [
          {
            symbol: stablecoinToken.symbol,
            address: stablecoinToken.address,
            amount: decimal(excessStablecoin),
            usd: excessStablecoin * (stablecoinToken.usdRate ?? 0),
          },
        ]
      : []),
  ]
}
