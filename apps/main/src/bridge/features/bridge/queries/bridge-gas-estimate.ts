import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { queryFactory } from '@ui/features/queries/factory'
import type { BridgeParams, BridgeQuery } from '../types'
import { bridgeValidationSuite } from '../validation/bridge.validation'

export const { useQuery: useBridgeGasEstimate } = queryFactory({
  queryKey: ({ chainId, userAddress, amount }: BridgeParams) =>
    [
      rootKeys.chain({ chainId }),
      rootKeys.user({ userAddress }),
      { name: 'fastBridge.estimateGas.bridge', amount },
    ] as const,
  queryFn: async ({ amount }: BridgeQuery) => await requireLib('curveApi').fastBridge.estimateGas.bridge(amount),
  category: 'bridge.user',
  validationSuite: bridgeValidationSuite,
})
