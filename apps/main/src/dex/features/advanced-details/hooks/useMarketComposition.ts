import { sum } from 'lodash'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { maybe } from '@primitives/objects.utils'
import { scanTokenPath } from '@ui/utils'
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
  const pricesApiTotalUsd = sum(pricesApiPoolData?.balancesUsd)

  // Transform Prices API reserves data to match the shape of currencyReserves (and not bothering with useMemo as arrays are super small)
  const reserves = usePricesApiReserves
    ? poolDataCacheOrApi.tokenAddresses.map((tokenAddress, index) => {
        const balance = pricesApiPoolData?.balances[index]
        const balanceUsd = pricesApiPoolData?.balancesUsd[index]

        return {
          tokenAddress,
          balance,
          balanceUsd,
          percentShareInPool: pricesApiTotalUsd ? ((balanceUsd ?? 0) / pricesApiTotalUsd) * 100 : undefined,
          usdRate: balance ? (balanceUsd ?? 0) / balance : 0,
        }
      })
    : currencyReserves?.tokens

  const rows: MarketCompositionRow[] = poolDataCacheOrApi.tokens
    .map((symbol, index) => {
      const tokenAddress = poolDataCacheOrApi.tokenAddresses[index]
      const reserve = reserves?.find(token => token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())

      return {
        source: {
          address: tokenAddress,
          blockchainId: network.id,
          iconPosition: 'left' as const,
          primary: symbol,
        },
        explorerUrl: scanTokenPath(network, tokenAddress),
        marketShare: maybe(reserve?.percentShareInPool, x => +x),
        amount: reserve?.balance,
        amountUsd: reserve?.balanceUsd,
        price: reserve?.usdRate,
      }
    })
    .filter(({ amount }) => amount)

  return {
    isLoading: usePricesApiReserves ? !pricesApiPoolData?.balances.length : !currencyReserves, // this isn't a proper loading check, but we need a bigger refactor for that later on
    rows,
    totalUsd: usePricesApiReserves ? pricesApiTotalUsd?.toString() : currencyReserves?.totalUsd,
  }
}
