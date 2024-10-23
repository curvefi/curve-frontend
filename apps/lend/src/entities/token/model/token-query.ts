import { TokenParams } from '@/entities/token'
import { queryTokenUsdRate } from '@/entities/token/api'
import { tokenValidationSuite } from '@/entities/token/model'
import { queryFactory, rootKeys } from '@/shared/model/query'

const root = ({ chainId, tokenAddress }: TokenParams) => [...rootKeys.chain({chainId}), 'token', { tokenAddress }] as const

export const tokenUsdRate = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: queryTokenUsdRate,
  staleTime: '5m',
  validationSuite: tokenValidationSuite,
})
