import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams } from '@ui-kit/lib/model'
import { curveApiWithWalletValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useBridgeCost } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'bridge-cost'] as const,
  queryFn: async () => await requireLib('curveApi').fastBridge.bridgeCost(),
  validationSuite: curveApiWithWalletValidationSuite,
})
