import { TokenParams, TokenQuery } from '@/lend/entities/token'
import type { Api } from '@/lend/types/lend.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from './validation'

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const tokenUsdRate = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: ({ tokenAddress }: TokenQuery): Promise<number> => requireLib<Api>().getUsdRate(tokenAddress),
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})
