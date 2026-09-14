import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  balanceValidationSuite,
  type BalanceQuery,
  type BalanceParams,
} from '@/stellar/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei, ZERO } from '@ui/lib/decimal'

export const {
  useQuery: useTokenBalance,
  getQueryOptions: getTokenBalanceQueryOptions,
  fetchQuery: fetchTokenBalance,
  invalidate: invalidateTokenBalance,
} = queryFactory({
  queryKey: ({ network, token, account, decimals }: BalanceParams) =>
    [...rootKeys.token({ network, token }), ...rootKeys.user({ account }), 'balance', { decimals }] as const,
  queryFn: async ({ network, token, account, decimals }: BalanceQuery) => {
    try {
      const result = await readContract<bigint>(network, token, 'balance', [account])
      return fromWei(result.toString(), decimals)
    } catch (error) {
      // Stellar asset contracts throw instead of returning zero when the account has no trustline.
      if ((error as Error).message.includes('trustline entry is missing for account')) return ZERO
      throw error
    }
  },
  category: 'global.tokenBalance',
  validationSuite: balanceValidationSuite,
})
