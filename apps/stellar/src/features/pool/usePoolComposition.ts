import { asAddress, shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserveAmounts } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { getTokenUsdRateQueryOptions } from '@/stellar/queries/token/token-usd-rate.query'
import { zip } from '@primitives/array.utils'
import { maybes } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
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
  const reserves = usePoolReserveAmounts({ network, pool }, decimals)
  const prices = useQueries({
    queries: tokenAddresses.data?.map(token => getTokenUsdRateQueryOptions({ network, token })) ?? [],
  })

  const amountsUsd =
    reserves && zip(reserves, prices).map(([reserve, price]) => combineQueries([reserve, price], decimalMultiply))
  const totalUsd = combineQueries([tokenAddresses, ...(amountsUsd ?? [])], (_, ...amounts) => decimalSum(...amounts))

  const rows = mapQuery(tokenAddresses, addresses =>
    maybes([symbols, reserves, amountsUsd], (symbols, reserves, amountsUsd) =>
      zip(addresses, symbols, reserves, amountsUsd).map(([address, symbol, amount, amountUsd]): PoolCompositionRow => ({
        source: { address: asAddress(address), blockchainId: network, iconPosition: 'left', primary: symbol },
        displayAddress: shortenAddress(address),
        amount,
        amountUsd,
        marketShare: combineQueries([amountUsd, totalUsd], decimalPercent),
      })),
    ),
  )

  return { totalUsd, rows }
}
