import { asAddress, shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { getTokenUsdRateQueryOptions } from '@/stellar/queries/token/token-usd-rate.query'
import { zip } from '@primitives/array.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'
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
  const reservesQuery = usePoolReserves({ network, pool, decimals: decimals?.map(q => q.data) })
  const reserves = q({ data: reservesQuery.data, ...combineQueryState(reservesQuery, ...(decimals ?? [])) })
  const prices = useQueries({
    queries: tokenAddresses.data?.map(token => getTokenUsdRateQueryOptions({ network, token })) ?? [],
  })

  const amountsUsd = maybe(reserves.data, amounts =>
    zip(amounts, prices).map(([amount, price]) => combineQueries([toQuery(amount, reserves), price], decimalMultiply)),
  )
  const totalUsd = q({
    data: maybe(amountsUsd, amounts => combineQueries(amounts, decimalSum).data),
    ...combineQueryState(tokenAddresses, reserves, ...(amountsUsd ?? [])),
  })

  const rows = q({
    data: maybes([tokenAddresses.data, symbols, reserves.data, amountsUsd], (addresses, symbols, amounts, amountsUsd) =>
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
