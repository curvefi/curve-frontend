import { readTokenBalance } from '@/features/connect-wallet/stellar-wallet-kit'
import { rootKeys } from '@/queries/root-keys'
import { balanceValidationSuite, type BalanceQuery, type BalanceParams } from '@/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

export const {
  useQuery: useTokenBalance,
  getQueryOptions: getTokenBalanceQueryOptions,
  invalidate: invalidateTokenBalance,
} = queryFactory({
  queryKey: ({ network, token, account, decimals }: BalanceParams) =>
    [...rootKeys.token({ network, token }), ...rootKeys.user({ account }), 'balance', { decimals }] as const,
  queryFn: async ({ network, token, account, decimals }: BalanceQuery) =>
    fromWei((await readTokenBalance(network, token, account)).toString(), decimals),
  category: 'global.tokenBalance',
  validationSuite: balanceValidationSuite,
})
