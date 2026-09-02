import { curvejsApi } from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { isChainLite } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { ChainParams, ChainQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query'
import { curveApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'

export const { useQuery: useAppStatsVolume } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsVolume', { chainId: params.chainId }] as const,
  queryFn: ({ chainId }: ChainQuery<ChainId>) =>
    isChainLite(chainId) ? Promise.resolve(null) : curvejsApi.network.getVolume(requireLib('curveApi')),
  validationSuite: curveApiValidationSuite,
  category: 'dex.appStats',
})
