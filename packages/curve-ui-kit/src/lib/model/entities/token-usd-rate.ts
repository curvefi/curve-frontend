import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { useQueryMapping } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
import { tokenValidationSuite } from '@ui-kit/lib/model/query/token-validation'

const root = ({ chainId, tokenAddress }: TokenParams) =>
  [...rootKeys.chain({ chainId }), 'token', { tokenAddress }] as const

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...root(params), 'usdRate'] as const,
  queryFn: ({ tokenAddress }: TokenQuery): Promise<number> =>
    getLib('curveApi')?.getUsdRate(tokenAddress) ?? requireLib('llamaApi').getUsdRate(tokenAddress),
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: tokenValidationSuite,
})

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))
  return useQueryMapping(
    uniqueAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    uniqueAddresses,
  )
}
