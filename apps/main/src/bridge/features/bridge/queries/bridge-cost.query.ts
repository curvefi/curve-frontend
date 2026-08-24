import { requireLib } from '@evm-ui/features/connect-wallet'
import { createValidationSuite } from '@evm-ui/lib'
import { queryFactory, rootKeys, type ChainParams } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { validateSupportedNetworkGroup } from '../validation/bridge.validation'

export const { useQuery: useBridgeCost, fetchQuery: fetchBridgeCost } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'fastBridge.bridgeCost'] as const,
  queryFn: async () => await requireLib('curveApi').fastBridge.bridgeCost(),
  category: 'bridge.cost',
  validationSuite: createValidationSuite((params: ChainParams) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
    validateSupportedNetworkGroup(params)
  }),
})
