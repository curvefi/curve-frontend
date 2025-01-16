import { TokenParams } from '@/lend/entities/token'
import { queryTokenUsdRate } from '@/lend/entities/token/api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from './validation'

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const tokenUsdRate = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: queryTokenUsdRate,
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})
