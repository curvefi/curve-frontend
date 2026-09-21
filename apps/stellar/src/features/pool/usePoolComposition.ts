import { shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { getTokenUsdRateQueryOptions } from '@/stellar/queries/token/token-usd-rate.query'
import { isComplete, zip } from '@primitives/array.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { aggregateQueries, combineQueries } from '@ui/features/queries/combine'
import { type QueryProp } from '@ui/features/queries/util'
import { decimalMultiply, decimalPercent, decimalSum, fromWei } from '@ui/lib/decimal'

export function usePoolComposition({
  network,
  pool,
  tokenAddresses,
  tokens,
  decimals,
}: PoolQuery & {
  tokenAddresses: QueryProp<StellarContract[]>
  tokens: QueryProp<PoolToken[]>
  decimals: QueryProp<(number | undefined)[]>
}) {
  const reserves = usePoolReserves({ network, pool })
  const prices = useQueries({
    queries: tokenAddresses.data?.map(token => getTokenUsdRateQueryOptions({ network, token })) ?? [],
  })

  const totalUsd = combineQueries([reserves, aggregateQueries(prices)], (reserves, rates) =>
    isComplete(rates)
      ? decimalSum(...zip(reserves, rates).map(([reserve, rate]) => decimalMultiply(reserve, rate)))
      : null,
  )

  const rows = combineQueries([tokenAddresses, tokens, decimals, reserves], (...queries) =>
    zip(...queries, prices).map(([address, token, decimals, reserve, { data: price }]): PoolCompositionRow => {
      const amount = maybe(decimals, decimals => fromWei(reserve, decimals))
      const amountUsd = maybes([amount, price], decimalMultiply)
      return {
        source: { address: token.address, blockchainId: network, iconPosition: 'left', primary: token.symbol },
        displayAddress: shortenAddress(address),
        amount,
        amountUsd,
        marketShare: maybes([amountUsd, totalUsd.data], decimalPercent),
      }
    }),
  )

  return { totalUsd, rows }
}
