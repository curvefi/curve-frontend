import { useCallback, useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { LlamaMarketType } from '@ui-kit/types/market'
import { type Address } from '@ui-kit/utils'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import {
  invalidateAllUserLendingSupplies,
  invalidateAllUserLendingVaults,
  invalidateLendingVaults,
} from '../../queries/market-list/lending-vaults'
import { useLlamaMarkets } from '../../queries/market-list/llama-markets'
import { invalidateAllUserMintMarkets, invalidateMintMarkets } from '../../queries/market-list/mint-markets'
import { createOnchainMarketKey } from '../../queries/market-list/onchain/overlay-fetch'
import {
  invalidateOnchainLlamaMarketsTableData,
  useOnchainLlamaMarketsTableData,
} from '../../queries/market-list/onchain/useOnchainLlamaMarketsTableData'
import { LendTableFooter } from './LendTableFooter'
import { LlamaMarketsTable } from './LlamaMarketsTable'
import { UserPositionsTabs } from './UserPositionTabs'

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const resolveOnchainFirstField = <T,>({
  onchainValue,
  apiValue,
  onchainDataReady,
}: {
  onchainValue: T | null | undefined
  apiValue: T | null | undefined
  onchainDataReady: boolean
}): {
  value: T | undefined
  source: 'onchain' | 'api' | undefined
} => {
  if (onchainValue != null) return { value: onchainValue, source: 'onchain' }
  if (!onchainDataReady) return { value: undefined, source: undefined }
  if (apiValue != null) return { value: apiValue, source: 'api' }
  return { value: undefined, source: undefined }
}
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
  const onchainDataQuery = useOnchainLlamaMarketsTableData(apiData?.markets, address)
  const onchainData = onchainDataQuery.data
  const onchainDataReady = onchainDataQuery.isFetched || onchainDataQuery.isError

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

          const borrowAprField = resolveOnchainFirstField({
            onchainValue: onchainBorrowApr,
            apiValue: market.rates.borrowApr,
            onchainDataReady,
          })
          const borrowApyField = resolveOnchainFirstField({
            onchainValue: onchainBorrowApy,
            apiValue: market.rates.borrowApy,
            onchainDataReady,
          })
          const lendAprField = resolveOnchainFirstField({
            onchainValue: rates?.lendApr,
            apiValue: market.rates.lendApr,
            onchainDataReady,
          })
          const lendApyField = resolveOnchainFirstField({
            onchainValue: rates?.lendApy,
            apiValue: market.rates.lendTotalApyMinBoosted,
            onchainDataReady,
          })

          const borrowApr = borrowAprField.value ?? market.rates.borrowApr
          const borrowApy = borrowApyField.value ?? market.rates.borrowApy
          const borrowTotalApr =
            borrowAprField.source === 'onchain'
              ? (resolveNetBorrowFromOnchainBase({
                  onchainBase: borrowAprField.value,
                  apiBase: market.rates.borrowApr,
                  apiNet: market.rates.borrowTotalApr,
                }) ?? borrowApr)
              : market.rates.borrowTotalApr
          const borrowTotalApy =
            borrowApyField.source === 'onchain'
              ? (resolveNetBorrowFromOnchainBase({
                  onchainBase: borrowApyField.value,
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
              lendApr: lendAprField.value ?? market.rates.lendApr,
              lendTotalApyMinBoosted: lendApyField.value ?? market.rates.lendTotalApyMinBoosted,
            },
            ...(userStats && { onchainUserStats: userStats }),
            ...(onchainData?.errorsByKey[key] && { onchainError: onchainData.errorsByKey[key] }),
            onchainDataReady,
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
