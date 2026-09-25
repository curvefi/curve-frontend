import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys, type ChainParams } from '@evm-ui/queries/root-keys'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
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
