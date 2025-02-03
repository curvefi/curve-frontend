import { queryFactory } from '@ui-kit/lib/model'
import { getFromLocalStorage, useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { useCallback, useMemo } from 'react'

const { getQueryOptions: getFavoriteMarketOptions, invalidate: invalidateFavoriteMarkets } = queryFactory({
  queryKey: () => ['lending-vaults-v3'] as const,
  queryFn: async (): Promise<string[]> => getFromLocalStorage<string[]>('favoriteMarkets') ?? [],
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
