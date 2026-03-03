import { useCallback, useMemo } from 'react'
import type { Address } from '@primitives/address.utils'
import { getFavoriteMarkets, useFavoriteMarkets } from '@ui-kit/hooks/useLocalStorage'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

const { getQueryOptions: getFavoriteMarketOptions, invalidate: invalidateFavoriteMarkets } = queryFactory({
  queryKey: () => ['favorite-markets'] as const,
  queryFn: async () => getFavoriteMarkets(),
  category: 'llamalend.user',
  validationSuite: EmptyValidationSuite,
})

/**
 * Adapts `useFavoriteMarkets` to a single market address.
 */
export function useFavoriteMarket(address: Address) {
  const [favorites, setFavorites] = useFavoriteMarkets()
  const isFavorite = useMemo(() => favorites.includes(address), [favorites, address])
  const toggleFavorite = useCallback(() => {
    setFavorites(isFavorite ? favorites.filter((id) => id !== address) : [...favorites, address])
    void invalidateFavoriteMarkets({}) // todo: set the query value directly
  }, [favorites, isFavorite, address, setFavorites])
  return [isFavorite, toggleFavorite] as const
}

export { getFavoriteMarketOptions }
