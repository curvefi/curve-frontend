import { curvejsApi } from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { ChainParams, ChainQuery } from '@evm-ui/queries/root-keys'
import { curveApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useAppStatsVolume } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsVolume', { chainId: params.chainId }] as const,
  queryFn: async ({ chainId }: ChainQuery<ChainId>) =>
    isLiteChain(chainId) ? null : await curvejsApi.network.getVolume(requireLib('curveApi')),
  validationSuite: curveApiValidationSuite,
  category: 'dex.appStats',
})
