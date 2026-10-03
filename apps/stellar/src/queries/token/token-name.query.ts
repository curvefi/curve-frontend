import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { TokenQuery, TokenParams } from '@/stellar/queries/query-types'
import { tokenValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useTokenName, getQueryOptions: getTokenNameQueryOptions } = queryFactory({
  queryKey: ({ network, token }: TokenParams) => ({ name: 'name', network, token }) as const,
  queryFn: ({ network, token }: TokenQuery) => readContract<string>(network, token, 'name'),
  category: 'dex.poolParams',
  validationSuite: tokenValidationSuite,
})
