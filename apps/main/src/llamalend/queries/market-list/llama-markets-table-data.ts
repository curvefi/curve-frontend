import { useMemo } from 'react'
import { type Address } from '@ui-kit/utils'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type LlamaMarket, useLlamaMarkets } from './llama-markets'
import { createOnchainMarketKey, fetchLlamaMarketsOnchainData } from './onchain/llama-markets-onchain'

const ONCHAIN_TABLE_QUERY_KEY = ['llama-markets', 'onchain-data'] as const
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const resolveNetBorrowFromOnchainBase = ({
  onchainBase,
  apiBase,
  apiNet,
}: {
  onchainBase: number | null | undefined
  apiBase: number | null | undefined
  apiNet: number | null | undefined
}) => {
  if (!isFiniteNumber(onchainBase)) return undefined
  const spread = isFiniteNumber(apiBase) && isFiniteNumber(apiNet) ? apiNet - apiBase : undefined
  return isFiniteNumber(spread) ? onchainBase + spread : onchainBase
}

const getOnchainSignature = (markets: LlamaMarket[]) =>
  markets
    .map(
      ({ chain, controllerAddress, ammAddress, vaultAddress, type, userHasPositions }) =>
        `${chain}:${controllerAddress.toLowerCase()}:${ammAddress.toLowerCase()}:${(vaultAddress ?? '').toLowerCase()}:${type}:${userHasPositions?.Borrow ? 1 : 0}`,
    )
    .join('|')

const getRefetchInterval = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible' ? REFRESH_INTERVAL['15s'] : false

const applyOnchainData = (
  apiMarkets: LlamaMarket[],
  onchainData: Awaited<ReturnType<typeof fetchLlamaMarketsOnchainData>>,
) =>
  apiMarkets.map((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const rates = onchainData.ratesByKey[key]
    const userStats = onchainData.userStatsByKey[key]
    const onchainBorrowApr =
      rates == null
        ? undefined
        : market.type === LlamaMarketType.Mint
          ? (rates.borrowApy ?? rates.borrowApr)
          : rates.borrowApr
    const onchainBorrowApy = rates == null ? undefined : (rates.borrowApy ?? rates.borrowApr)

    const borrowApr = onchainBorrowApr ?? market.rates.borrowApr
    const borrowApy = onchainBorrowApy ?? market.rates.borrowApy
    const borrowTotalApr =
      onchainBorrowApr != null
        ? (resolveNetBorrowFromOnchainBase({
            onchainBase: onchainBorrowApr,
            apiBase: market.rates.borrowApr,
            apiNet: market.rates.borrowTotalApr,
          }) ?? borrowApr)
        : market.rates.borrowTotalApr
    const borrowTotalApy =
      onchainBorrowApy != null
        ? (resolveNetBorrowFromOnchainBase({
            onchainBase: onchainBorrowApy,
            apiBase: market.rates.borrowApy,
            apiNet: market.rates.borrowTotalApy,
          }) ?? borrowApy)
        : market.rates.borrowTotalApy

    return {
      ...market,
      rates: {
        ...market.rates,
        borrowApr,
        borrowApy,
        borrowTotalApr,
        borrowTotalApy,
        lendApr: rates?.lendApr ?? market.rates.lendApr,
        lendTotalApyMinBoosted: rates?.lendApy ?? market.rates.lendTotalApyMinBoosted,
      },
      ...(userStats && { onchainUserStats: userStats }),
    }
  })

export const invalidateLlamaMarketsOnchainData = (userAddress: Address | null | undefined) =>
  queryClient.invalidateQueries({ queryKey: [...ONCHAIN_TABLE_QUERY_KEY, userAddress ?? ''] })

export const useLlamaMarketsTableData = (userAddress: Address | undefined) => {
  const apiQuery = useLlamaMarkets(userAddress)
  const apiMarkets = apiQuery.data?.markets ?? []
  const onchainSignature = useMemo(() => (apiMarkets.length ? getOnchainSignature(apiMarkets) : ''), [apiMarkets])

  const onchainQuery = useQuery({
    queryKey: [...ONCHAIN_TABLE_QUERY_KEY, userAddress ?? '', onchainSignature],
    queryFn: async () => fetchLlamaMarketsOnchainData(apiMarkets, userAddress),
    enabled: apiMarkets.length > 0,
    staleTime: REFRESH_INTERVAL['10s'],
    refetchInterval: getRefetchInterval,
  })

  return {
    ...apiQuery,
    data:
      apiQuery.data && onchainQuery.data
        ? { ...apiQuery.data, markets: applyOnchainData(apiQuery.data.markets, onchainQuery.data) }
        : apiQuery.data,
    isFetching: apiQuery.isFetching || onchainQuery.isFetching,
  }
}
