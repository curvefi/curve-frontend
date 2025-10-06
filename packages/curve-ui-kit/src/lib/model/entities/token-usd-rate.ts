import { enforce, group, test } from 'vest'
import { useQueries } from '@tanstack/react-query'
import { getLib } from '@ui-kit/features/connect-wallet'
import { combineQueriesToObject, createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams, type TokenParams, type TokenQuery } from '@ui-kit/lib/model/query'
import { tokenValidationGroup } from '@ui-kit/lib/model/query/token-validation'

const QUERY_KEY_IDENTIFIER = 'usdRate' as const

export const {
  getQueryData: getTokenUsdRateQueryData,
  useQuery: useTokenUsdRate,
  fetchQuery: fetchTokenUsdRate,
  getQueryOptions: getTokenUsdRateQueryOptions,
} = queryFactory({
  queryKey: (params: TokenParams) => [...rootKeys.token(params), QUERY_KEY_IDENTIFIER] as const,
  queryFn: ({ chainId, tokenAddress }: TokenQuery): Promise<number> => {
    const curve = getLib('curveApi')
    if (curve?.chainId === chainId) return curve.getUsdRate(tokenAddress)
    const llama = getLib('llamaApi')
    if (llama?.chainId === chainId) return llama.getUsdRate(tokenAddress)
    throw new Error('No matching API library found')
  },
  staleTime: '5m',
  refetchInterval: '1m',
  validationSuite: createValidationSuite(({ chainId, tokenAddress }: TokenParams) => {
    tokenValidationGroup({ chainId, tokenAddress })
    group('apiValidation', () => {
      test('api', 'API chain ID mismatch', () => {
        enforce(getLib('llamaApi')?.chainId === chainId || getLib('curveApi')?.chainId === chainId)
          .isTrue()
          .message(`No matching API library found for chain ID ${chainId}`)
      })
    })
  }),
})

export const useTokenUsdRates = ({ chainId, tokenAddresses = [] }: ChainParams & { tokenAddresses?: string[] }) => {
  const uniqueAddresses = Array.from(new Set(tokenAddresses))

  return useQueries({
    queries: uniqueAddresses.map((tokenAddress) => getTokenUsdRateQueryOptions({ chainId, tokenAddress })),
    combine: (results) => combineQueriesToObject(results, uniqueAddresses),
  })
}
