import { useMemo } from 'react'
import type { Address } from 'viem'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import type { TokenOption } from '@ui-kit/features/select-token'
import { useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { TokenListProps } from './ui/modal/TokenList'

/**
 * Hook to fetch token balances and USD rates for the token selector.
 * Only fetches when the modal is open.
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
  const tokenAddresses = useMemo(() => (enabled ? tokens.map((token) => token.address) : []), [enabled, tokens])

  const { data: balances } = useTokenBalances({ chainId, userAddress, tokenAddresses }, enabled)

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
