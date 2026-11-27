import { sum } from 'lodash'
import { getAddress } from 'viem'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { shortenAddress } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import { maybe } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { litePoolToComposition } from '@ui/features/pools/pool-composition/lite-pool-composition'
import { constQ, fallbackQ, mapQuery, q } from '@ui/features/queries/util'
import { decimal } from '@ui/lib/decimal'

export const usePoolComposition = () => {
  const { chainId, blockchainId, poolAddress, isWrapped, apiPool, litePool } = usePoolContext()
  // Keep tokens and balances from the same source when falling back from RPC to API data.
  const composition = fallbackQ(
    q(usePoolCurrencyReserves({ chainId, poolAddress, isWrapped })),
    mapQuery(apiPool, pool => {
      const totalUsd = sum(pool.balancesUsd)
      // Match the currency-reserves shape
      return {
        totalUsd: decimal(totalUsd),
        tokens: pool.coins
          .toSorted((a, b) => a.poolIndex - b.poolIndex)
          .map(({ address, symbol, poolIndex }) => {
            const balance = pool.balances[poolIndex]
            const balanceUsd = pool.balancesUsd[poolIndex]
            return {
              token: symbol || shortenAddress(address),
              tokenAddress: address,
              balance,
              balanceUsd,
              percentShareInPool: totalUsd ? (balanceUsd / totalUsd) * 100 : undefined,
              usdRate: balance ? balanceUsd / balance : undefined,
            }
          }),
      }
    }),
    mapQuery(litePool, pool => maybe(pool, litePoolToComposition)),
  )

  return {
    rows: mapQuery(composition, ({ tokens }) =>
      tokens?.map<PoolCompositionRow>(({ token, tokenAddress, balance, balanceUsd, percentShareInPool, usdRate }) => ({
        source: { address: getAddress(tokenAddress), blockchainId, iconPosition: 'left' as const, primary: token },
        displayAddress: shortenAddress(tokenAddress),
        explorerUrl: scanTokenPath(chainId, tokenAddress),
        marketShare: constQ(maybe(percentShareInPool, x => +x)),
        amount: constQ(balance),
        amountUsd: constQ(balanceUsd),
        price: constQ(usdRate),
      })),
    ),
    totalUsd: mapQuery(composition, ({ totalUsd }) => totalUsd),
  }
}
