import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { rootKeys, type TokenQuery, type TokenParams } from '@/stellar/queries/root-keys'
import { tokenValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useTokenName, getQueryOptions: getTokenNameQueryOptions } = queryFactory({
  queryKey: ({ network, token }: TokenParams) => [...rootKeys.token({ network, token }), 'name'] as const,
  queryFn: ({ network, token }: TokenQuery) => readContract<string>(network, token, 'name'),
  category: 'dex.poolParams',
  validationSuite: tokenValidationSuite,
})
