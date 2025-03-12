import { useCallback, useMemo } from 'react'
import { getFromLocalStorage, useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

const { getQueryOptions: getFavoriteMarketOptions, invalidate: invalidateFavoriteMarkets } = queryFactory({
  queryKey: () => ['favorite-markets'] as const,
  queryFn: async () => getFromLocalStorage<string[]>('favoriteMarkets') ?? [],
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})

export function useFavoriteMarket(address: string) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteMarkets', [])
  const isFavorite = useMemo(() => favorites.includes(address), [favorites, address])
  const toggleFavorite = useCallback(() => {
    isFavorite ? setFavorites(favorites.filter((id) => id !== address)) : setFavorites([...favorites, address])
    invalidateFavoriteMarkets({})
  }, [favorites, isFavorite, address, setFavorites])
  return [isFavorite, toggleFavorite] as const
}

export { getFavoriteMarketOptions }
