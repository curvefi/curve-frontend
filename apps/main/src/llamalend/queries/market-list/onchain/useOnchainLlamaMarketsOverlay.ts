import { useMemo } from 'react'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { type Address as UiAddress } from '@ui-kit/utils'
import { fetchOnchainLlamaMarketsOverlay } from './overlay-fetch'

type OverlayQueryOptions = {
  enabled?: boolean
}

const QUERY_KEY = ['llama-markets', 'onchain-overlay'] as const

const getSignature = (markets: LlamaMarket[]) =>
  markets
    .map((market) =>
      [
        market.chain,
        market.controllerAddress.toLowerCase(),
        market.ammAddress.toLowerCase(),
        (market.vaultAddress ?? '').toLowerCase(),
        market.type,
        market.assets.borrowed.address.toLowerCase(),
        market.assets.collateral.address.toLowerCase(),
        market.userHasPositions?.Borrow ? '1' : '0',
        market.userHasPositions?.Supply ? '1' : '0',
      ].join(':'),
    )
    .sort()
    .join('|')

const getRefetchInterval = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible' ? REFRESH_INTERVAL['15s'] : false

export const invalidateOnchainLlamaMarketsOverlay = (userAddress: UiAddress | null | undefined) =>
  queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, userAddress ?? ''] })

export const useOnchainLlamaMarketsOverlay = (
  markets: LlamaMarket[] | undefined,
  userAddress: UiAddress | undefined,
  options?: OverlayQueryOptions,
) => {
  const safeMarkets = markets ?? []
  const signature = useMemo(() => (safeMarkets.length ? getSignature(safeMarkets) : ''), [safeMarkets])

  return useQuery({
    queryKey: [...QUERY_KEY, userAddress ?? '', signature],
    queryFn: async () => fetchOnchainLlamaMarketsOverlay(safeMarkets, userAddress),
    enabled: (options?.enabled ?? true) && safeMarkets.length > 0,
    staleTime: REFRESH_INTERVAL['10s'],
    refetchInterval: getRefetchInterval,
  })
}
