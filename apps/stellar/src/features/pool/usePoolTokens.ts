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
  tokenAddresses,
}: NetworkParams & UserParams & { tokenAddresses: QueryProp<StellarContract[]> }) {
  const addresses = tokenAddresses.data ?? [] // useQueries doesn't accept undefined
  const decimals = useQueries({
    queries: addresses.map(token => getTokenDecimalsQueryOptions({ network, token })),
    combine: aggregateQueries,
  })
  const symbols = useQueries({
    queries: addresses.map(token => getTokenSymbolQueryOptions({ network, token })),
    combine: aggregateQueries,
  })
  const names = useQueries({
    queries: addresses.map(token => getTokenNameQueryOptions({ network, token })),
    combine: aggregateQueries,
  })
  const metadata = combineQueries([decimals, symbols, names], (decimals, symbols, names) =>
    zip(decimals, symbols, names).map(([decimals, symbol, name]) => ({ decimals, symbol, name })),
  )
  const { balances, maxAmounts } = useQueries({
    queries:
      maybe(decimals.data, decimals =>
        zip(addresses, decimals).map(([token, decimals]) =>
          getTokenBalanceQueryOptions({ network, token, account, decimals }),
        ),
      ) ?? [],
    combine: results => ({ balances: results.map(q), maxAmounts: aggregateQueries(results) }),
  })
  const tokens = combineQueries([tokenAddresses, metadata], (addresses, metadata) =>
    zip(addresses, metadata, balances).map(([address, metadata, balance]) => ({
      blockchainId: network ?? undefined,
      address: asAddress(address),
      symbol: metadata.symbol,
      balance,
    })),
  )
  return { tokens, decimals, maxAmounts }
}
