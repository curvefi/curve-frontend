import { useMemo } from 'react'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { type Address as UiAddress } from '@ui-kit/utils'
import { fetchOnchainLlamaMarketsTableData } from './overlay-fetch'

type OnchainTableDataQueryOptions = {
  enabled?: boolean
}

const QUERY_KEY = ['llama-markets', 'onchain-table-data'] as const

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

export const invalidateOnchainLlamaMarketsTableData = (userAddress: UiAddress | null | undefined) =>
  queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, userAddress ?? ''] })

export const useOnchainLlamaMarketsTableData = (
  markets: LlamaMarket[] | undefined,
  userAddress: UiAddress | undefined,
  options?: OnchainTableDataQueryOptions,
) => {
  const safeMarkets = markets ?? []
  const signature = useMemo(() => (safeMarkets.length ? getSignature(safeMarkets) : ''), [safeMarkets])

  return useQuery({
    queryKey: [...QUERY_KEY, userAddress ?? '', signature],
    queryFn: async () => fetchOnchainLlamaMarketsTableData(safeMarkets, userAddress),
    enabled: (options?.enabled ?? true) && safeMarkets.length > 0,
    staleTime: REFRESH_INTERVAL['10s'],
    refetchInterval: getRefetchInterval,
  })
}
