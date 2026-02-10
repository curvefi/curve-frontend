import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { useConfig } from 'wagmi'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import type { TokenOption } from '@ui-kit/features/select-token'
import { prefetchTokenBalances, useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { TokenListProps } from './ui/modal/TokenList'

/**
 * Hook to fetch token balances and USD rates for the token selector.
 * Prefetches balances on mount for better UX when opening the modal.
 * Only actively fetches when the modal is open (enabled being true).
 */
export const useTokenSelectorData = (
  {
    tokens,
    chainId,
    userAddress,
  }: {
    tokens: TokenOption[]
    chainId: number
    userAddress?: Address
  },
  { enabled, prefetch }: { enabled: boolean; prefetch: boolean },
): Pick<TokenListProps, 'balances' | 'tokenPrices' | 'isLoading'> & { isPrefetched: boolean } => {
  const config = useConfig()
  const tokenAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])

  /**
   * Tracks whether prefetching has completed so the token selector can be disabled until
   * cached data is available. Without this, opening the modal before prefetch finishes
   * causes `useTokenBalances` to fire individual queries per token (1000+), bypassing
   * the batched multicall. A future refactor should replace `useTokenBalances` entirely
   * with direct cache reads after prefetch, avoiding the overhead of creating a TanStack
   * Query observer per token — which causes excessive re-renders when the user switches
   * address or when staleTime expires while the modal is open. In other words, we shouldn't
   * use query hooks for the giant list.
   */
  const [isPrefetched, setIsPrefetched] = useState(false)

  /*
   * Prefetch balances eagerly so they're cached before the modal opens.
   * This reduces the visible "trickle-in" effect of balances loading one by one,
   * minimizing re-renders and providing a smoother user experience.
   * It also means balances are being loaded without creating TanStack subscriptions.
   *
   * Prefetch can be done conditionally such that important data can be loaded first,
   * so that the HTTP request pipeline won't get clogged up with less important requests.
   *
   * At the moment of writing the array of token addresses can contain more than 1000 items.
   * It's up to a future refactor to reduce the amount of token balances fetched.
   */
  useEffect(() => {
    if (prefetch && chainId && userAddress && tokenAddresses.length > 0) {
      void prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses }).then(() => {
        setIsPrefetched(true)
      })
    }
  }, [prefetch, config, chainId, userAddress, tokenAddresses])

  const { data: balances, isLoading } = useTokenBalances(
    { chainId, userAddress, tokenAddresses: enabled ? tokenAddresses : [] },
    enabled,
  )

  // Only fetch prices for tokens the user has a balance of
  const tokenAddressesWithBalance = useMemo(
    () =>
      Object.keys(balances ?? {}).length
        ? recordEntries(balances)
            .filter(([, balance]) => +balance > 0)
            .map(([address]) => address)
        : [],
    [balances],
  )

  const { data: tokenPrices } = useTokenUsdRates({ chainId, tokenAddresses: tokenAddressesWithBalance }, enabled)

  return { balances, tokenPrices, isLoading, isPrefetched }
}
