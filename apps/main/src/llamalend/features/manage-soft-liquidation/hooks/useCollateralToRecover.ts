import { BigNumber } from 'bignumber.js'
import { sumBy } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useUserState } from '@/llamalend/queries/user'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy } from '@curvefi/primitives/objects.utils'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { type Query } from '@ui-kit/types/util'
import { decimal, type Decimal } from '@ui-kit/utils'
import type { Token } from '../types'

type TokenWithPrice = Token & { amount: Decimal; usd: Decimal | undefined }

/**
 * Calculates the recoverable collateral and stablecoin when closing a position in soft liquidation
 *
 * This hook determines what assets a user can recover when closing their position:
 * 1. Any remaining collateral tokens (if collateral > 0)
 * 2. Excess stablecoin tokens (if stablecoin balance > outstanding debt)
 *
 * @returns Array of recoverable token objects with symbol, address, amount, and USD value
 */
export function useCollateralToRecover({
  chainId,
  market,
}: {
  chainId: LlamaChainId
  market: LlamaMarketTemplate | undefined
}): Query<TokenWithPrice[]> & { totalUsd: number | undefined } {
  const { address: userAddress } = useConnection()
  const { data: userState, error, isLoading } = useUserState({ chainId, marketId: market?.id, userAddress })
  const { collateral, debt, stablecoin } = userState ?? {}

  // Get market tokens
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  // Fetch USD rates for tokens
  const { data: borrowTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address })

  const { data: collateralTokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address })

  const excessStablecoin = decimal(stablecoin && debt && BigNumber(stablecoin).minus(debt))
  const data = notFalsy(
    Number(collateral) > 0 &&
      collateralToken && {
        // Add collateral tokens if user has any remaining after position closure
        symbol: collateralToken.symbol,
        address: collateralToken.address,
        amount: collateral!,
        usd: decimal(collateralTokenUsdRate && BigNumber(collateral!).times(collateralTokenUsdRate)),
      },
    Number(excessStablecoin) > 0 &&
      borrowToken && {
        // Add excess stablecoin (stablecoin balance minus outstanding debt) if positive
        symbol: borrowToken.symbol,
        address: borrowToken.address,
        amount: excessStablecoin!,
        usd: decimal(borrowTokenUsdRate && BigNumber(excessStablecoin!).times(borrowTokenUsdRate)),
      },
  )
  return {
    data,
    isLoading,
    error,
    totalUsd: useMemo(() => sumBy(data, ({ usd }) => Number(usd) || 0), [data]),
  }
}
