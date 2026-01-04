import { useEffect, useMemo } from 'react'
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
  enabled = true,
): Pick<TokenListProps, 'balances' | 'tokenPrices'> => {
  const config = useConfig()
  const tokenAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])

  // Prefetch balances eagerly so they're cached before the modal opens.
  // This reduces the visible "trickle-in" effect of balances loading one by one,
  // minimizing re-renders and providing a smoother user experience.
  useEffect(() => {
    if (chainId && userAddress && tokenAddresses.length > 0) {
      prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses })
    }
  }, [config, chainId, userAddress, tokenAddresses])

  const { data: balances } = useTokenBalances(
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

  return { balances, tokenPrices }
}
