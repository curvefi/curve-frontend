import { useMemo } from 'react'
import { getTokens, withLpCoins } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useTokenLpCoins } from '@/llamalend/queries/token-lp-coins.query'
import type { Chain } from '@curvefi/prices-api'
import { maybe } from '@primitives/objects.utils'

/** The tokens of a market, with the coins of LP tokens, which the contracts don't know */
export const useMarketTokens = ({
  blockchainId,
  market,
  apiMarket,
}: {
  blockchainId: Chain
  market: MarketTemplate | undefined
  apiMarket: LlamaMarket | undefined
}) => {
  // the React compiler can't cache a value created before the hook calls below
  const tokens = useMemo(() => getTokens(market, apiMarket), [market, apiMarket])
  const { data: collateralLpCoins } = useTokenLpCoins({ blockchainId, tokenAddress: tokens?.collateralToken.address })
  const { data: borrowLpCoins } = useTokenLpCoins({ blockchainId, tokenAddress: tokens?.borrowToken.address })
  return maybe(tokens, ({ collateralToken, borrowToken }) => ({
    collateralToken: withLpCoins(collateralToken, collateralLpCoins),
    borrowToken: withLpCoins(borrowToken, borrowLpCoins),
  }))
}
