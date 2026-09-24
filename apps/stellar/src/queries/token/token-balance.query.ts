import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  type BalanceParams,
  type BalanceQuery,
  balanceValidationSuite,
} from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'
import { fromWei } from '@ui/lib/decimal'

const TRUSTLINE_MISSING_ERROR = 'trustline entry is missing for account'

export const isTrustlineMissingError = (error: Error) => error.message.includes(TRUSTLINE_MISSING_ERROR)

export const {
  useQuery: useTokenBalance,
  getQueryOptions: getTokenBalanceQueryOptions,
  fetchQuery: fetchTokenBalance,
  invalidate: invalidateTokenBalance,
} = queryFactory({
  queryKey: ({ network, token, account, decimals }: BalanceParams) =>
    [...rootKeys.token({ network, token }), ...rootKeys.user({ account }), 'balance', { decimals }] as const,
  queryFn: async ({ network, token, account, decimals }: BalanceQuery) =>
    fromWei(await readContract<bigint>(network, token, 'balance', [account]), decimals),
  category: 'global.tokenBalance',
  validationSuite: balanceValidationSuite,
})
