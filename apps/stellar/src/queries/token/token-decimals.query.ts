import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { rootKeys, type TokenQuery, type TokenParams } from '@/stellar/queries/root-keys'
import { tokenValidationSuite } from '@/stellar/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'

export const {
  useQuery: useTokenDecimals,
  getQueryOptions: getTokenDecimalsQueryOptions,
  fetchQuery: fetchTokenDecimals,
} = queryFactory({
  queryKey: ({ network, token }: TokenParams) => [...rootKeys.token({ network, token }), 'decimals'] as const,
  queryFn: ({ network, token }: TokenQuery) => readContract<number>(network, token, 'decimals'),
  category: 'dex.poolParams',
  validationSuite: tokenValidationSuite,
})
