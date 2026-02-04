import { queryFactory, rootKeys, type ChainParams } from '@ui-kit/lib/model'
import { curveApiWithWalletValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useBridgeCapacity } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'bridge-capacity'] as const,
  // eslint-disable-next-line arrow-body-style
  queryFn: async () => {
    return { min: 0, max: 100 }
    //return await requireLib('curveApi').fastBridge.allowedToBridge()
  },
  validationSuite: curveApiWithWalletValidationSuite,
})
