import { useCallback } from 'react'
import { asAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import type { NetworkParams, UserParams } from '@/stellar/queries/query-types'
import { getTokenBalanceQueryOptions } from '@/stellar/queries/token/token-balance.query'
import { getTokenDecimalsQueryOptions } from '@/stellar/queries/token/token-decimals.query'
import { getTokenNameQueryOptions } from '@/stellar/queries/token/token-name.query'
import { getTokenSymbolQueryOptions } from '@/stellar/queries/token/token-symbol.query'
import { zip } from '@primitives/array.utils'
import { maybes } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import { aggregateQueries, useCombinedQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, q, type QueryProp } from '@ui/features/queries/util'

const disableCombine = () => DISABLED_Q

/**
 * Queries the token balances, decimals, symbols, and names for the given tokens.
 */
export function usePoolTokens({
  network,
  account,
  tokenAddresses,
}: NetworkParams & UserParams & { tokenAddresses: QueryProp<StellarContract[]> }) {
  const addresses = tokenAddresses.data ?? [] // useQueries doesn't accept undefined
  const combine = tokenAddresses.data ? aggregateQueries : disableCombine // aggregateQueries requires at least one query
  const decimals = useQueries({
    queries: addresses.map(token => getTokenDecimalsQueryOptions({ network, token })),
    combine,
  })
  const symbols = useQueries({
    queries: addresses.map(token => getTokenSymbolQueryOptions({ network, token })),
    combine,
  })
  const names = useQueries({ queries: addresses.map(token => getTokenNameQueryOptions({ network, token })), combine })
  const metadata = useCombinedQueries(
    [decimals, symbols, names],
    useCallback(
      (decimals, symbols, names) =>
        zip(decimals, symbols, names).map(([decimals, symbol, name]) => ({ decimals, symbol, name })),
      [],
    ),
  )
  const balances = useQueries({
    queries:
      maybes([decimals.data, tokenAddresses.data], (decimals, addresses) =>
        zip(addresses, decimals).map(([token, decimals]) =>
          getTokenBalanceQueryOptions({ network, token, account, decimals }),
        ),
      ) ?? [],
    combine: results => results.map(q),
  })
  const tokens = useCombinedQueries(
    [tokenAddresses, metadata],
    useCallback(
      (addresses, metadata) =>
        zip(addresses, metadata, balances).map(([address, metadata, balance]) => ({
          blockchainId: network ?? undefined,
          address: asAddress(address),
          symbol: metadata.symbol,
          balance,
        })),
      [balances, network],
    ),
  )
  return { tokens, decimals, maxAmounts: balances }
}
