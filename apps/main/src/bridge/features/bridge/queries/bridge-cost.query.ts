import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSupportedNetworkGroup } from '../validation/bridge.validation'

export const { useQuery: useBridgeCost, fetchQuery: fetchBridgeCost } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'fastBridge.bridgeCost', chainId }) as const,
  queryFn: async () => await requireLib('curveApi').fastBridge.bridgeCost(),
  category: 'bridge.cost',
  validationSuite: createValidationSuite((params: ChainParams) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
    validateSupportedNetworkGroup(params)
  }),
})
