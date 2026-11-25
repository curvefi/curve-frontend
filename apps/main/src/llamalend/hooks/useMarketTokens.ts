import { useMemo } from 'react'
import { getTokens } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useTokenMetadata } from '@/llamalend/queries/token-metadata.query'
import type { Chain } from '@curvefi/prices-api'
import { type Nullish, maybe } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'

/** Destructured so the compiler can cache it: `useQuery` returns a new object every render */
const useLpCoins = (params: Parameters<typeof useTokenMetadata>[0]) => {
  const { data, isLoading, error } = useTokenMetadata(params)
  return q({ data: data?.lpCoins, isLoading, error })
}

/** The tokens of a market, with the query of their LP coins, which the contracts don't know */
export const useMarketTokens = ({
  blockchainId,
  market,
  apiMarket,
}: {
  blockchainId: Chain
  market: MarketTemplate | Nullish
  apiMarket: LlamaMarket | Nullish
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
