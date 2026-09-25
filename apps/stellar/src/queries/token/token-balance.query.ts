import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  type BalanceParams,
  type BalanceQuery,
  balanceValidationSuite,
} from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

export const {
  useQuery: useTokenBalance,
  getQueryOptions: getTokenBalanceQueryOptions,
  fetchQuery: fetchTokenBalance,
  invalidate: invalidateTokenBalance,
} = queryFactory({
  queryKey: ({ network, token, account, decimals }: BalanceParams) =>
    [rootKeys.token({ network, token }), rootKeys.user({ account }), { name: 'balance', decimals }] as const,
  queryFn: async ({ network, token, account, decimals }: BalanceQuery) =>
    fromWei(
      await readContract<bigint>(network, token, 'balance', [account]).catch(error => {
        // Stellar asset contracts throw instead of returning zero when the account has no trustline.
        if ((error as Error).message.includes('trustline entry is missing for account')) return 0n
        throw error
      }),
      decimals,
    ),
  category: 'global.tokenBalance',
  validationSuite: balanceValidationSuite,
})
