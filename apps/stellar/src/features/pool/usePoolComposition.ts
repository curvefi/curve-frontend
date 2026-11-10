import { asAddress, shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenUsdRates } from '@/stellar/queries/token/token-usd-rate.query'
import { zip } from '@primitives/array.utils'
import { maybe, maybes, recordValues } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { q, type QueryProp, toQuery } from '@ui/features/queries/util'
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
  const prices = tokenAddresses.data?.map(address => usdRates[address])

  const amountsUsd = maybes([reserves.data, prices], (amounts, prices) =>
    zip(amounts, prices).map(([amount, price]) => combineQueries([toQuery(amount, reserves), price], decimalMultiply)),
  )
  const totalUsd = combineQueries([tokenAddresses, reserves, ...recordValues(usdRates)], (_, amounts, ...rates) =>
    decimalSum(...zip(amounts, rates).map(([amount, rate]) => decimalMultiply(amount, rate))),
  )

  const rows = q({
    data: maybes(
      [tokenAddresses.data, symbols, reserves.data, amountsUsd, prices],
      (addresses, symbols, amounts, amountsUsd, prices) =>
        zip(addresses, symbols, amounts, amountsUsd, prices).map(
          ([address, symbol, amount, amountUsd, price]): PoolCompositionRow => ({
            source: { address: asAddress(address), blockchainId: network, iconPosition: 'left', primary: symbol },
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

  return { totalUsd, rows }
}
