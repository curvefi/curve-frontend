import { asAddress, shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenUsdRates } from '@/stellar/queries/token/token-usd-rate.query'
import { zip } from '@primitives/array.utils'
import { maybe } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalMultiply, decimalPercent, decimalSum } from '@ui/lib/decimal'

export function usePoolComposition({
  network,
  pool,
  tokenAddresses,
  symbols,
  decimals,
}: PoolQuery & {
  tokenAddresses: QueryProp<StellarContract[]>
  symbols: QueryProp<string>[] | undefined
  decimals: QueryProp<number>[] | undefined
}) {
  const precision = maybe(decimals, queries => combineQueries(queries, (...values) => values))
  const reservesQuery = usePoolReserves({ network, pool, decimals: precision?.data })
  const reserves = q({ data: reservesQuery.data, ...combineQueryState(reservesQuery, precision) })
  const usdRates = useTokenUsdRates({ network, tokenAddresses: tokenAddresses.data })
  const prices = combineQueries(tokenAddresses.data?.map(address => usdRates[address]) ?? [], (...rates) => rates)
  const totalUsd = combineQueries([tokenAddresses, reserves, prices], (_, amounts, rates) =>
    decimalSum(...zip(amounts, rates).map(([amount, rate]) => decimalMultiply(amount, rate))),
  )

  const rows = combineQueries([tokenAddresses, reserves, prices, totalUsd], (addresses, amounts, prices, totalUsd) =>
    maybe(symbols, symbols =>
      zip(addresses, symbols, amounts, prices).map(([address, symbol, amount, price]): PoolCompositionRow => {
        const amountUsd = decimalMultiply(amount, price)
        return {
          source: { address: asAddress(address), blockchainId: network, iconPosition: 'left', primary: symbol },
          displayAddress: shortenAddress(address),
          amount,
          price,
          amountUsd,
          marketShare: decimalPercent(amountUsd, totalUsd),
        }
      }),
    ),
  )

  return { totalUsd, rows }
}
