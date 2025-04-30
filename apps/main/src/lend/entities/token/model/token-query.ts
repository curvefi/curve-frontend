import { TokenParams, TokenQuery } from '@/lend/entities/token'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import type { LlamalendApi } from '@ui-kit/shared/useApiStore'
import { tokenValidationSuite } from './validation'

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const tokenUsdRate = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: ({ tokenAddress }: TokenQuery): Promise<number> => requireLib<LlamalendApi>().getUsdRate(tokenAddress),
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})
