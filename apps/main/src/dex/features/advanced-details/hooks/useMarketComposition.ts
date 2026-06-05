import { useMemo } from 'react'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { maybe } from '@primitives/objects.utils'
import { scanAddressPath } from '@ui/utils'
import type { MarketCompositionRow } from '../components/market-composition/columns/columns.definitions'

export const useMarketComposition = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const { data: network } = useNetworkByChain({ chainId })
  const currencyReserves = useStore(state => state.pools.currencyReserves[getChainPoolIdActiveKey(chainId, poolId)])

  // We use prices API as a fallback for non-lite networks, and currencyReserves.total is NaN when no wallet is connected.
  const usePricesApiReserves = isNaN(Number(currencyReserves?.total)) && !network.isLite
  const pricesApiTotalUsd = pricesApiPoolData?.balancesUsd.reduce((total, balanceUsd) => total + balanceUsd, 0)

  const rows = useMemo<MarketCompositionRow[]>(
    () =>
      poolDataCacheOrApi.tokens
        .map((symbol, index) => {
          const tokenAddress = poolDataCacheOrApi.tokenAddresses[index]
          const reserve = currencyReserves?.tokens.find(
            token => token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
          )
          const balance = usePricesApiReserves ? pricesApiPoolData?.balances[index] : reserve?.balance
          const balanceUsd = usePricesApiReserves ? pricesApiPoolData?.balancesUsd[index] : reserve?.balanceUsd

          return {
            symbol,
            tokenAddress,
            tokenAddressUrl: scanAddressPath(network, tokenAddress),
            blockchainId: network?.id,
            marketShare: maybe(
              usePricesApiReserves && pricesApiTotalUsd
                ? ((balanceUsd ?? 0) / pricesApiTotalUsd) * 100
                : reserve?.percentShareInPool,
              x => +x,
            ),
            tokenAmount: balance,
            tokenAmountUsd: balanceUsd,
            tokenPrice: usePricesApiReserves ? (balance ? (balanceUsd ?? 0) / balance : 0) : reserve?.usdRate,
          }
        })
        .filter(({ tokenAmount }) => tokenAmount),
    [
      currencyReserves?.tokens,
      network,
      poolDataCacheOrApi.tokenAddresses,
      poolDataCacheOrApi.tokens,
      pricesApiPoolData?.balances,
      pricesApiPoolData?.balancesUsd,
      pricesApiTotalUsd,
      usePricesApiReserves,
    ],
  )

  return {
    isLoading: usePricesApiReserves ? !pricesApiPoolData?.balances.length : !currencyReserves, // this isn't a proper loading check, but we need a bigger refactor for that later on
    rows,
    totalUsd: usePricesApiReserves ? pricesApiTotalUsd?.toString() : currencyReserves?.totalUsd,
  }
}
