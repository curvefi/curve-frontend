import { readContract } from '@/features/connect-wallet/stellar-wallet-kit'
import { rootKeys, type TokenQuery, type TokenParams } from '@/queries/root-keys'
import { tokenValidationSuite } from '@/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useTokenDecimals, getQueryOptions: getTokenDecimalsQueryOptions } = queryFactory({
  queryKey: ({ network, token }: TokenParams) => [...rootKeys.token({ network, token }), 'decimals'] as const,
  queryFn: ({ network, token }: TokenQuery) => readContract<number>(network, token, 'decimals'),
  category: 'dex.poolParams',
  validationSuite: tokenValidationSuite,
})
