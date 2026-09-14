import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/lib/model'
import { queryFactory } from '@ui/features/queries/factory'
import type { BridgeParams, BridgeQuery } from '../types'
import { bridgeValidationSuite } from '../validation/bridge.validation'

export const { useQuery: useBridgeApproveGasEstimate } = queryFactory({
  queryKey: ({ chainId, userAddress, amount }: BridgeParams) =>
    [
      ...rootKeys.chain({ chainId }),
      ...rootKeys.user({ userAddress }),
      'amount',
      { amount },
      'fastBridge.estimateGas.approve',
    ] as const,
  queryFn: async ({ amount }: BridgeQuery) => await requireLib('curveApi').fastBridge.estimateGas.approve(amount),
  category: 'bridge.user',
  validationSuite: bridgeValidationSuite,
})
