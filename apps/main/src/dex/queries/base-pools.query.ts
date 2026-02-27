import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams } from '@ui-kit/lib/model'
import { curveApiWithWalletValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useBasePools, getQueryData: getBasePools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'base-pools'] as const,
  queryFn: async () => await requireLib('curveApi').getBasePools(),
  validationSuite: curveApiWithWalletValidationSuite,
  category: 'dex.poolParams',
})
