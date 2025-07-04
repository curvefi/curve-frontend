import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import useUserProfileStore from '@ui-kit/features/user-profile/store'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

const { getQueryOptions: getFavoriteMarketOptions, invalidate: invalidateFavoriteMarkets } = queryFactory({
  queryKey: () => ['favorite-markets'] as const,
  queryFn: async () => useUserProfileStore.getState().favoriteMarkets,
  validationSuite: EmptyValidationSuite,
})

export function useFavoriteMarket(address: Address) {
  const favorites = useUserProfileStore((state) => state.favoriteMarkets)
  const setFavorites = useUserProfileStore((state) => state.setFavoriteMarkets)
  const isFavorite = useMemo(() => favorites.includes(address), [favorites, address])
  const toggleFavorite = useCallback(() => {
    isFavorite ? setFavorites(favorites.filter((id) => id !== address)) : setFavorites([...favorites, address])
    invalidateFavoriteMarkets({})
  }, [favorites, isFavorite, address, setFavorites])
  return [isFavorite, toggleFavorite] as const
}

export { getFavoriteMarketOptions }
