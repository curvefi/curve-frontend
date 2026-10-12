import { asAddress, shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { getTokenUsdRateQueryOptions } from '@/stellar/queries/token/token-usd-rate.query'
import { zip } from '@primitives/array.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
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
  decimals: (number | undefined)[] | undefined
}) {
  const reserves = usePoolReserves({ network, pool, decimals })
  const prices = useQueries({
    queries: tokenAddresses.data?.map(token => getTokenUsdRateQueryOptions({ network, token })) ?? [],
  })

  const amountsUsd = maybe(reserves.data, amounts =>
    zip(amounts, prices).map(([amount, price]) => combineQueries([toQuery(amount, reserves), price], decimalMultiply)),
  )
  const totalUsd = combineQueries([reserves, ...(amountsUsd ?? [])], (_, ...amounts) => decimalSum(...amounts))

  const rows = q({
    data: maybes([tokenAddresses.data, symbols, reserves.data, amountsUsd], (addresses, symbols, amounts, amountsUsd) =>
      zip(addresses, symbols, amounts, amountsUsd).map(([address, symbol, amount, amountUsd]): PoolCompositionRow => ({
        source: { address: asAddress(address), blockchainId: network, iconPosition: 'left', primary: symbol },
        displayAddress: shortenAddress(address),
        amount: toQuery(amount, reserves),
        amountUsd,
        marketShare: combineQueries([amountUsd, totalUsd], decimalPercent),
      })),
    ),
    ...combineQueryState(tokenAddresses, reserves, totalUsd, ...(symbols ?? [])),
  })

  return { totalUsd, rows }
}
