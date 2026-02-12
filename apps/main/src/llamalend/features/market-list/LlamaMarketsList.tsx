import { useCallback, useEffect, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type Address } from '@ui-kit/utils'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@ui-kit/lib/api'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model/time'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import {
  invalidateAllUserLendingSupplies,
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
} from '../../queries/market-list/lending-vaults'
import { useLlamaMarkets } from '../../queries/market-list/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets } from '../../queries/market-list/mint-markets'
import {
  createOnchainMarketKey,
  fetchOnchainLlamaMarketsTableData,
} from '../../queries/market-list/onchain/overlay-fetch'
import { LendTableFooter } from './LendTableFooter'
import { LlamaMarketsTable } from './LlamaMarketsTable'
import { UserPositionsTabs } from './UserPositionTabs'

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

const ONCHAIN_TABLE_QUERY_KEY = ['llama-markets', 'onchain-table-data'] as const
const getOnchainTableSignature = (markets: NonNullable<ReturnType<typeof useLlamaMarkets>['data']>['markets']) =>
  markets
    .map(
      ({ chain, controllerAddress, ammAddress, vaultAddress, type, userHasPositions }) =>
        `${chain}:${controllerAddress.toLowerCase()}:${ammAddress.toLowerCase()}:${(vaultAddress ?? '').toLowerCase()}:${type}:${userHasPositions?.Borrow ? 1 : 0}`,
    )
    .join('|')
const getOnchainRefetchInterval = () =>
  typeof document === 'undefined' || document.visibilityState === 'visible' ? REFRESH_INTERVAL['15s'] : false
const invalidateOnchainLlamaMarketsTableData = (userAddress: Address | null | undefined) =>
  queryClient.invalidateQueries({ queryKey: [...ONCHAIN_TABLE_QUERY_KEY, userAddress ?? ''] })

/**
 * Creates a callback to reload the markets and user data.
 * Returns a tuple with:
 * - `isReloading`: boolean indicating if the reload is in progress.
 *                  without this, react-query will show the stale data so the user doesn't notice the reload.
 * - `onReload`: function to trigger the reload.
 * Note: It does not reload the snapshots (for now).
 */
const useOnReload = ({ address: userAddress, isFetching }: { address?: Address; isFetching: boolean }) => {
  const [isReloading, setIsReloading] = useState(false)
  const onReload = useCallback(() => {
    if (isReloading) return
    setIsReloading(true)

    void Promise.all([
      invalidateLendingVaults({}),
      invalidateMintMarkets({}),
      invalidateAllUserLendingVaults(userAddress),
      invalidateAllUserLendingSupplies(userAddress),
      invalidateAllUserMintMarkets(userAddress),
      invalidateOnchainLlamaMarketsTableData(userAddress),
    ])
  }, [isReloading, userAddress])

  useEffect(() => {
    // reset the isReloading state when the data is fetched
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isReloading && !isFetching) setIsReloading(false)
  }, [isFetching, isReloading])

  return [isReloading && isFetching, onReload] as const
}

/**
 * Page for displaying the lending markets table.
 */
export const LlamaMarketsList = () => {
  const { address } = useConnection()
  const { data: apiData, isError, isLoading, isFetching } = useLlamaMarkets(address)
  const safeMarkets = apiData?.markets ?? []
  const onchainSignature = useMemo(
    () => (safeMarkets.length ? getOnchainTableSignature(safeMarkets) : ''),
    [safeMarkets],
  )
  const { data: onchainData } = useQuery({
    queryKey: [...ONCHAIN_TABLE_QUERY_KEY, address ?? '', onchainSignature],
    queryFn: async () => fetchOnchainLlamaMarketsTableData(safeMarkets, address),
    enabled: safeMarkets.length > 0,
    staleTime: REFRESH_INTERVAL['10s'],
    refetchInterval: getOnchainRefetchInterval,
  })

  const data = !apiData
    ? apiData
    : {
        ...apiData,
        markets: apiData.markets.map((market) => {
          const key = createOnchainMarketKey(market.chain, market.controllerAddress)
          const rates = onchainData?.ratesByKey[key]
          const userStats = onchainData?.userStatsByKey[key]
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
        }),
      }

  const [isReloading, onReload] = useOnReload({ address, isFetching })
  const loading = isReloading || (!data && (!isError || isLoading))
  return (
    <ListPageWrapper footer={<LendTableFooter />}>
      {(data?.userHasPositions || !address) && (
        <UserPositionsTabs onReload={onReload} result={data} isError={isError} loading={loading} />
      )}
      <LlamaMarketsTable onReload={onReload} result={data} isError={isError} loading={loading} />
    </ListPageWrapper>
  )
}
