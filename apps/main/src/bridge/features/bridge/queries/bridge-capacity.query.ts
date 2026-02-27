import { requireLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib'
import { queryFactory, rootKeys, type ChainParams } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { validateSupportedNetworkGroup } from '../validation/bridge.validation'

export const { useQuery: useBridgeCapacity } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'fastBridge.allowedToBridge'] as const,
  queryFn: async () => await requireLib('curveApi').fastBridge.allowedToBridge(),
  category: 'detail',
  validationSuite: createValidationSuite((params: ChainParams) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
    validateSupportedNetworkGroup(params)
  }),
})
