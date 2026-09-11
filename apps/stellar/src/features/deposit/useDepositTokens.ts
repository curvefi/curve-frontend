import type { StellarAddress } from '@/features/connect-wallet/address'
import type { NetworkParams, UserParams } from '@/queries/root-keys'
import { getTokenBalanceQueryOptions } from '@/queries/token/token-balance.query'
import { getTokenDecimalsQueryOptions } from '@/queries/token/token-decimals.query'
import { getTokenNameQueryOptions } from '@/queries/token/token-name.query'
import { getTokenSymbolQueryOptions } from '@/queries/token/token-symbol.query'
import { zip } from '@primitives/array.utils'
import { useQueries } from '@tanstack/react-query'
import { aggregateQueries, combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'

export function useDepositTokens({
  network,
  account,
  tokens: { data: tokens = [] },
}: NetworkParams & UserParams & { tokens: QueryProp<StellarAddress[]> }) {
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
      mapQuery(decimals, decimals =>
        zip(tokens, decimals).map(([token, decimals]) =>
          getTokenBalanceQueryOptions({ network, token, account, decimals }),
        ),
      ).data ?? [],
    combine: results => ({ balances: results.map(q), maxAmounts: aggregateQueries(results) }),
  })
  return { metadata, balances, decimals, maxAmounts }
}
