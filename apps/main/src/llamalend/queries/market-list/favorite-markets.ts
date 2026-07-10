import { useCallback, useMemo } from 'react'
import type { Address } from '@primitives/address.utils'
import { getFavoriteMarkets, useFavoriteMarkets as useStoredFavoriteMarkets } from '@ui-kit/hooks/useLocalStorage'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

const { getQueryOptions: getFavoriteMarketOptions, invalidate: invalidateFavoriteMarkets } = queryFactory({
  queryKey: () => ['favorite-markets'] as const,
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  queryFn: async () => getFavoriteMarkets(),
  category: 'llamalend.user',
  validationSuite: EmptyValidationSuite,
})

/** Provides the favorite markets and an operation to toggle one market. */
export function useFavoriteMarkets() {
  const [favorites, setFavorites] = useStoredFavoriteMarkets()
  const toggleFavorite = useCallback(
    (address: Address) => {
      setFavorites(currentFavorites =>
        currentFavorites.includes(address)
          ? currentFavorites.filter(favorite => favorite !== address)
          : [...currentFavorites, address],
      )
      void invalidateFavoriteMarkets({}) // todo: set the query value directly
    },
    [setFavorites],
  )
  return [favorites, toggleFavorite] as const
}

/**
 * Adapts `useFavoriteMarkets` to a single market address.
 */
export function useFavoriteMarket(address: Address) {
  const [favorites, toggleFavoriteMarket] = useFavoriteMarkets()
  const isFavorite = useMemo(() => favorites.includes(address), [favorites, address])
  const toggleFavorite = useCallback(() => toggleFavoriteMarket(address), [address, toggleFavoriteMarket])
  return [isFavorite, toggleFavorite] as const
}

export { getFavoriteMarketOptions }
