import { TokenParams } from '@/entities/token'
import { queryTokenUsdRate } from '@/entities/token/api'
import { queryFactory, rootKeys } from '@/shared/model/query'
import { tokenValidationSuite } from './validation'

const root = ({ chainId, tokenAddress }: TokenParams) => [...rootKeys.chain({chainId}), 'token', { tokenAddress }] as const

export const tokenUsdRate = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: queryTokenUsdRate,
  staleTime: '5m',
  validationSuite: tokenValidationSuite,
})
