import {
  asAddress,
  asStellarContract,
  shortenAddress,
  type StellarContract,
} from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenUsdRates } from '@/stellar/queries/token/token-usd-rate.query'
import type { LitePool } from '@curvefi/prices-api/pools'
import { zip } from '@primitives/array.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { litePoolToComposition } from '@ui/features/pools/pool-composition/lite-pool-composition'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { constQ, fallbackQ, mapQuery, q, type QueryProp, toQuery } from '@ui/features/queries/util'
import { decimalMultiply, decimalPercent, decimalSum } from '@ui/lib/decimal'

export function usePoolComposition({
  network,
  pool,
  tokenAddresses,
  symbols,
  decimals,
  litePool,
}: PoolQuery & {
  tokenAddresses: QueryProp<StellarContract[]>
  symbols: QueryProp<string>[] | undefined
  decimals: QueryProp<number>[] | undefined
  litePool: QueryProp<LitePool | null>
}) {
  const precision = maybe(decimals, queries => combineQueries(queries, (...values) => values))
  const reservesQuery = usePoolReserves({ network, pool, decimals: precision })
  const reserves = q({ data: reservesQuery.data, ...combineQueryState(reservesQuery, precision) })
  const usdRates = useTokenUsdRates({ network, tokenAddresses: tokenAddresses.data })
  const apiComposition = mapQuery(litePool, pool => maybe(pool, litePoolToComposition))
  const prices = tokenAddresses.data?.map(address =>
    fallbackQ(
      usdRates[address],
      mapQuery(
        apiComposition,
        ({ tokens }) => tokens?.find(token => token.tokenAddress === asAddress(address))?.usdRate,
      ),
    ),
  )

  const amountsUsd = maybes([reserves.data, prices], (amounts, prices) =>
    zip(amounts, prices).map(([amount, price]) => combineQueries([toQuery(amount, reserves), price], decimalMultiply)),
  )
  const totalUsd = combineQueries([tokenAddresses, reserves, ...(prices ?? [])], (_, amounts, ...rates) =>
    decimalSum(...zip(amounts, rates).map(([amount, rate]) => decimalMultiply(amount, rate))),
  )

  const rows = q({
    data: maybes(
      [tokenAddresses.data, symbols, reserves.data, amountsUsd, prices],
      (addresses, symbols, amounts, amountsUsd, prices) =>
        zip(addresses, symbols, amounts, amountsUsd, prices).map(
          ([address, symbol, amount, amountUsd, price]): PoolCompositionRow => ({
            source: {
              address: asAddress(address),
              blockchainId: network,
              iconPosition: 'left',
              primary: fallbackQ(
                symbol,
                mapQuery(
                  apiComposition,
                  ({ tokens }) => tokens?.find(token => token.tokenAddress === asAddress(address))?.token,
                ),
              ),
            },
            displayAddress: shortenAddress(address),
            amount: toQuery(amount, reserves),
            price: q(price),
            amountUsd,
            marketShare: combineQueries([amountUsd, totalUsd], decimalPercent),
          }),
        ),
    ),
    ...combineQueryState(tokenAddresses, reserves),
  })

  return {
    totalUsd: fallbackQ(
      totalUsd,
      mapQuery(apiComposition, ({ totalUsd }) => totalUsd),
    ),
    rows: fallbackQ(
      rows,
      mapQuery(apiComposition, ({ tokens }) =>
        tokens?.map<PoolCompositionRow>(token => ({
          source: { address: token.tokenAddress, blockchainId: network, iconPosition: 'left', primary: token.token },
          displayAddress: shortenAddress(asStellarContract(token.tokenAddress)),
          amount: constQ(token.balance),
          price: constQ(token.usdRate),
          amountUsd: constQ(token.balanceUsd),
          marketShare: constQ(token.percentShareInPool),
        })),
      ),
    ),
  }
}
