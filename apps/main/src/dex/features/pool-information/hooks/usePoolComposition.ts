import { sum } from 'lodash'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { q, type QueryProp } from '@evm-ui/types/util'
import { scanTokenPath } from '@legacy-ui/utils'
import { maybe } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '../components/pool-composition/columns/columns.definitions'

type PoolComposition = {
  error: Error | null
  isLoading: boolean
  query: QueryProp<PoolCompositionRow[] | undefined>
  rows: PoolCompositionRow[] | undefined
  totalUsd: string | undefined
}

export const usePoolComposition = ({
  chainId,
  poolQuery,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
  pricesApiPoolData?: PricesApiPool
}): PoolComposition => {
  const poolDataCacheOrApi = poolQuery.data
  const poolId = poolDataCacheOrApi?.pool.id
  const { data: network } = useNetworkByChain({ chainId })
  const currencyReserves = useStore(state => state.pools.currencyReserves[getChainPoolIdActiveKey(chainId, poolId)])

  // We use prices API as a fallback for non-lite networks, and currencyReserves.total is NaN when no wallet is connected.
  const usePricesApiReserves = isNaN(Number(currencyReserves?.total)) && !network.isLite
  const pricesApiTotalUsd = sum(pricesApiPoolData?.balancesUsd)

  // Transform Prices API reserves data to match the shape of currencyReserves (and not bothering with useMemo as arrays are super small)
  const reserves = usePricesApiReserves
    ? poolDataCacheOrApi?.tokenAddresses.map((tokenAddress, index) => {
        const balance = pricesApiPoolData?.balances[index]
        const balanceUsd = pricesApiPoolData?.balancesUsd[index]

        return {
          tokenAddress,
          balance,
          balanceUsd,
          percentShareInPool:
            pricesApiTotalUsd && balanceUsd != null ? (balanceUsd / pricesApiTotalUsd) * 100 : undefined,
          usdRate: balance && balanceUsd != null ? balanceUsd / balance : undefined,
        }
      })
    : currencyReserves?.tokens

  const rows = poolDataCacheOrApi?.tokens.map((symbol, index) => {
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

  const isLoading =
    !poolDataCacheOrApi || (usePricesApiReserves ? !pricesApiPoolData?.balances.length : !currencyReserves)

  return {
    error: null, // TODO: correctly handle error and loading state
    // this isn't a proper loading check, but we need a bigger refactor for that later on
    isLoading,
    query: q({ data: rows, isLoading, error: null }),
    rows,
    totalUsd: usePricesApiReserves ? pricesApiTotalUsd?.toString() : currencyReserves?.totalUsd,
  }
}
