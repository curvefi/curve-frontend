import { useMemo } from 'react'
import { getTokens } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useTokenLpCoins } from '@/llamalend/queries/token-lp-coins.query'
import type { Chain } from '@curvefi/prices-api'
import { maybe } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'

/** Takes the query fields apart, so the result stays the same between renders and the market context doesn't change */
const useLpCoins = (params: Parameters<typeof useTokenLpCoins>[0]) => {
  const { data, isLoading, error } = useTokenLpCoins(params)
  return q({ data, isLoading, error })
}

/** The tokens of a market, with the query of their LP coins, which the contracts don't know */
export const useMarketTokens = ({
  blockchainId,
  market,
  apiMarket,
}: {
  blockchainId: Chain
  market: MarketTemplate | undefined
  apiMarket: LlamaMarket | undefined
}) => {
  // without useMemo, the React compiler doesn't cache `tokens`: it's passed to functions after the hook calls,
  // so the compiler assumes they may modify it, and a cached block can't contain hooks
  const tokens = useMemo(() => getTokens(market, apiMarket), [market, apiMarket])
  const collateralLpCoins = useLpCoins({ blockchainId, tokenAddress: tokens?.collateralToken.address })
  const borrowLpCoins = useLpCoins({ blockchainId, tokenAddress: tokens?.borrowToken.address })
  return maybe(tokens, ({ collateralToken, borrowToken }) => ({
    collateralToken: { ...collateralToken, lpCoins: collateralLpCoins },
    borrowToken: { ...borrowToken, lpCoins: borrowLpCoins },
  }))
}
