import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams } from '@evm-ui/lib/model'
import { curveApiWithWalletValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'

export const { useQuery: useBasePools, getQueryData: getBasePools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'base-pools'] as const,
  queryFn: async () => await requireLib('curveApi').getBasePools(),
  validationSuite: curveApiWithWalletValidationSuite,
  category: 'dex.poolParams',
})
