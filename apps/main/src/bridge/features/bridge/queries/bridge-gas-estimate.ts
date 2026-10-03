import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory } from '@ui/features/queries/factory'
import type { BridgeParams, BridgeQuery } from '../types'
import { bridgeValidationSuite } from '../validation/bridge.validation'

export const { useQuery: useBridgeGasEstimate } = queryFactory({
  queryKey: ({ chainId, userAddress, amount }: BridgeParams) => ({
    name: 'fastBridge.estimateGas.bridge',
    chainId,
    userAddress,
    amount,
  }),
  queryFn: async ({ amount }: BridgeQuery) => await requireLib('curveApi').fastBridge.estimateGas.bridge(amount),
  category: 'bridge.user',
  validationSuite: bridgeValidationSuite,
})
