import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BridgeParams, BridgeQuery } from '../types'
import { bridgeValidationSuite } from '../validation/bridge.validation'

export const { useQuery: useBridgeGasEstimate } = queryFactory({
  queryKey: ({ chainId, userAddress, amount }: BridgeParams) =>
    [
      ...rootKeys.chain({ chainId }),
      ...rootKeys.user({ userAddress }),
      'amount',
      { amount },
      'fastBridge.estimateGas.bridge',
    ] as const,
  queryFn: async ({ amount }: BridgeQuery) => await requireLib('curveApi').fastBridge.estimateGas.bridge(amount),
  validationSuite: bridgeValidationSuite,
})
