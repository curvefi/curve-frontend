import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams } from '@ui-kit/lib/model'
import { curveApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useBasePools, getQueryData: getBasePools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'base-pools'] as const,
  queryFn: async () => {
    const curve = requireLib('curveApi')
    return curve.isNoRPC ? [] : await curve.getBasePools()
  },
  staleTime: '5m',
  validationSuite: curveApiValidationSuite,
})
