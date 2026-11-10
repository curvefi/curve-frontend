import { sum } from 'lodash'
import { getAddress } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { shortenAddress } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import { zip } from '@primitives/array.utils'
import { maybe } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { combineQueries } from '@ui/features/queries/combine'
import { constQ, mapQuery } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'

export const usePoolComposition = () => {
  const { chainId, poolAddress, isWrapped, tokens, tokenAddresses, apiPool } = usePoolContext()
  const { data: network } = useNetworkByChain({ chainId })

  const currencyReserves = usePoolCurrencyReserves({ chainId, poolAddress, isWrapped })

  // TODO: currencyReserves.total is NaN when no wallet is connected, but that should be handled inside usePoolCurrencyReserves.
  const useCurrencyReserves = mapQuery(
    currencyReserves,
    reserves => !isNaN(Number(reserves.total)) || isLiteChain(chainId),
  )

  const pricesApiTotalUsd = mapQuery(apiPool, pool => sum(pool.balancesUsd))
  const currencyReservesTotalUsd = mapQuery(currencyReserves, reserves => reserves.totalUsd)

  const reserves = useCurrencyReserves.data
    ? mapQuery(currencyReserves, reserves => reserves.tokens)
    : combineQueries([apiPool, pricesApiTotalUsd, tokenAddresses], (pool, total, tokenAddresses) =>
        // Transform Prices API reserves data to match the shape of currencyReserves (and not bothering with useMemo as arrays are super small)
        tokenAddresses.map((tokenAddress, index) => {
          const balance = pool?.balances[index]
          const balanceUsd = pool?.balancesUsd[index]

          return {
            tokenAddress,
            balance,
            balanceUsd,
            percentShareInPool: total ? ((balanceUsd ?? 0) / total) * 100 : undefined,
            usdRate: balance ? (balanceUsd ?? 0) / balance : 0,
          }
        }),
      )

  const rows = combineQueries([reserves, tokens, tokenAddresses], (reserves, tokens, tokenAddresses) =>
    zip(tokens, tokenAddresses).map<PoolCompositionRow>(([symbol, tokenAddress]) => {
      const reserve = reserves.find(token => token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())

      return {
        source: {
          address: getAddress(tokenAddress),
          blockchainId: network.blockchainId,
          iconPosition: 'left' as const,
          primary: symbol,
        },
        displayAddress: shortenAddress(tokenAddress),
        explorerUrl: scanTokenPath(chainId, tokenAddress),
        marketShare: constQ(maybe(reserve?.percentShareInPool, x => +x)),
        amount: constQ(reserve?.balance),
        amountUsd: constQ(reserve?.balanceUsd),
        price: constQ(reserve?.usdRate),
      }
    }),
  )

  const totalUsd = useCurrencyReserves.data
    ? currencyReservesTotalUsd
    : mapQuery(pricesApiTotalUsd, totalUsd => decimal(totalUsd))

  return { rows, totalUsd }
}
