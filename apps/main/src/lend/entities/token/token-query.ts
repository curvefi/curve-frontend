import { TokenParams, TokenQuery } from '@/lend/entities/token/index'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from './validation'

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: ({ tokenAddress }: TokenQuery): Promise<number> => requireLib('llamaApi').getUsdRate(tokenAddress),
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})
