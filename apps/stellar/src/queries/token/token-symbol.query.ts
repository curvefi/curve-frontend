import { readContract } from '@/features/connect-wallet/stellar-wallet-kit'
import { rootKeys, type TokenQuery, type TokenParams } from '@/queries/root-keys'
import { tokenValidationSuite } from '@/queries/validation/deposit.validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { getQueryOptions: getTokenSymbolQueryOptions } = queryFactory({
  queryKey: ({ network, token }: TokenParams) => [...rootKeys.token({ network, token }), 'symbol'] as const,
  queryFn: ({ network, token }: TokenQuery) => readContract<string>(network, token, 'symbol'),
  category: 'dex.poolParams',
  validationSuite: tokenValidationSuite,
})
