import { useEffect, useMemo } from 'react'
import { useConfig } from 'wagmi'
import type { Address } from '@primitives/address.utils'
import { recordEntries } from '@primitives/objects.utils'
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
): Pick<TokenListProps, 'balances' | 'tokenPrices' | 'isLoading'> => {
  const config = useConfig()
  const tokenAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])

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
      void prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses })
    }
  }, [prefetch, config, chainId, userAddress, tokenAddresses])

  const { data: balances, isLoading } = useTokenBalances(
    { chainId, userAddress, tokenAddresses: enabled ? tokenAddresses : [] },
    // We only care for query observers and don't want to invoke queryFn for each token balance separately, so we disable the query and rely on prefetchTokenBalances.
    false,
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

  return { balances, tokenPrices, isLoading }
}
