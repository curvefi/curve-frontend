import { shortenAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { getTokenUsdRateQueryOptions } from '@/stellar/queries/token/token-usd-rate.query'
import { completeArray, zip } from '@primitives/array.utils'
import { maybes } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import type { PoolCompositionRow } from '@ui/features/pools/pool-composition/columns/columns.definitions'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
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
  const rates = useQueries({
    queries: (tokenAddresses.data ?? []).map(token => getTokenUsdRateQueryOptions({ network, token })),
  })
  const allRates = combineQueries(rates, (...data) => tokenAddresses.data && completeArray(data))

  const reserveRows = combineQueries(
    [tokenAddresses, tokens, decimals, reserves],
    (addresses, tokens, decimals, reserves) =>
      maybes(
        [completeArray(decimals), completeArray(tokens.map(({ symbol }) => symbol))],
        (decimals, symbols): PoolCompositionRow[] =>
          zip(addresses, tokens, decimals, symbols, reserves).map(([address, token, decimals, symbol, reserve]) => ({
            source: { address: token.address, blockchainId: network, iconPosition: 'left', primary: symbol },
            displayAddress: shortenAddress(address),
            amount: fromWei(reserve, decimals),
          })),
      ),
  )

  const totalUsd = combineQueries([reserves, allRates], (reserves, rates) =>
    decimalSum(...zip(reserves, rates).map(([reserve, rate]) => decimalMultiply(reserve, rate))),
  )
  const rows = mapQuery(reserveRows, rows =>
    zip(rows, rates).map(([row, { data: rate }]) => ({
      ...row,
      price: rate,
      amountUsd: maybes([row.amount, rate], (amount, rate) => Number(decimalMultiply(amount, rate))),
      marketShare: maybes([row.amount, rate, totalUsd.data], (amount, rate, total) =>
        decimalPercent(decimalMultiply(amount, rate), total),
      ),
    })),
  )

  return { totalUsd, rows }
}
