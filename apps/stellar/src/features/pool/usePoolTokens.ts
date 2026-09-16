import { asAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import type { NetworkParams, UserParams } from '@/stellar/queries/root-keys'
import { getTokenBalanceQueryOptions } from '@/stellar/queries/token/token-balance.query'
import { getTokenDecimalsQueryOptions } from '@/stellar/queries/token/token-decimals.query'
import { getTokenNameQueryOptions } from '@/stellar/queries/token/token-name.query'
import { getTokenSymbolQueryOptions } from '@/stellar/queries/token/token-symbol.query'
import { zip } from '@primitives/array.utils'
import { maybe } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import { aggregateQueries, combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'

/**
 * Queries the token balances, decimals, symbols, and names for the given tokens.
 */
export function usePoolTokens({
  network,
  account,
  tokens: tokenQuery,
}: NetworkParams & UserParams & { tokens: QueryProp<StellarContract[]> }) {
  const tokens = tokenQuery.data ?? [] // useQueries doesn't accept undefined
  const decimals = useQueries({
    queries: tokens.map(token => getTokenDecimalsQueryOptions({ network, token })),
    combine: aggregateQueries,
  })
  const symbols = useQueries({
    queries: tokens.map(token => getTokenSymbolQueryOptions({ network, token })),
    combine: aggregateQueries,
  })
  const names = useQueries({
    queries: tokens.map(token => getTokenNameQueryOptions({ network, token })),
    combine: aggregateQueries,
  })
  const metadata = combineQueries([decimals, symbols, names], (decimals, symbols, names) =>
    zip(decimals, symbols, names).map(([decimals, symbol, name]) => ({ decimals, symbol, name })),
  )
  const { balances, maxAmounts } = useQueries({
    queries:
      maybe(decimals.data, decimals =>
        zip(tokens, decimals).map(([token, decimals]) =>
          getTokenBalanceQueryOptions({ network, token, account, decimals }),
        ),
      ) ?? [],
    combine: results => ({ balances: results.map(q), maxAmounts: aggregateQueries(results) }),
  })
  const inputs = combineQueries([tokenQuery, metadata], (addresses, metadata) =>
    zip(addresses, metadata, balances).map(([address, metadata, balance]) => ({
      address: asAddress(address),
      symbol: metadata.symbol,
      balance,
    })),
  )
  return { inputs, decimals, maxAmounts }
}
