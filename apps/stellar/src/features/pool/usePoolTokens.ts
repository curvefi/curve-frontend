import { useCallback, useMemo } from 'react'
import { asAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import type { NetworkParams, UserParams } from '@/stellar/queries/query-types'
import { getTokenBalanceQueryOptions } from '@/stellar/queries/token/token-balance.query'
import { getTokenDecimalsQueryOptions } from '@/stellar/queries/token/token-decimals.query'
import { getTokenSymbolQueryOptions } from '@/stellar/queries/token/token-symbol.query'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useQueries } from '@tanstack/react-query'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type Query, type QueryProp } from '@ui/features/queries/util'

const combine = <T>(results: Query<T>[]): QueryProp<T>[] => results.map(q)
const EMPTY: never[] = []

/**
 * Keeps metadata and balance query states independent for each token, in pool order.
 */
export function usePoolTokens({
  network,
  account,
  tokenAddresses,
}: NetworkParams & UserParams & { tokenAddresses: QueryProp<StellarContract[]> }) {
  const addresses = tokenAddresses.data ?? EMPTY // useQueries doesn't accept undefined
  const decimals = useQueries({
    queries: addresses.map(token => getTokenDecimalsQueryOptions({ network, token })),
    combine,
  })
  const symbols = useQueries({
    queries: addresses.map(token => getTokenSymbolQueryOptions({ network, token })),
    combine,
  })

  const balances = useQueries({
    queries: zip(addresses, decimals).map(([token, decimals]) =>
      getTokenBalanceQueryOptions({ network, token, account, decimals: decimals.data }),
    ),
    combine: useCallback(
      // propagate every decimal loading state to the balances
      (balances: Query<Decimal>[]) => zip(balances, decimals).map(qs => combineQueries(qs, balance => balance)),
      [decimals],
    ),
  })
  const tokens = useMemo(
    () =>
      zip(addresses, symbols, balances).map(([address, symbol, balance]): QueryProp<PoolToken> =>
        mapQuery(symbol, symbol => ({
          blockchainId: network ?? undefined,
          address: asAddress(address),
          symbol,
          balance,
        })),
      ),
    [addresses, symbols, balances, network],
  )

  const decimalsData = useMemo(() => decimals.map(q => q.data), [decimals])
  if (tokenAddresses.data) return { tokens, symbols, decimals, decimalsData, maxAmounts: balances }
}
