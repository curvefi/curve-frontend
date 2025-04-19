import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import type { ChainId, CurveApi } from '@/dex/types/main.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curvejsValidationSuite } from './validation/curvejs-validation'

async function _fetchAppStatsVolume({ chainId }: ChainQuery<ChainId>) {
  const { isLite } = useStore.getState().networks.networks[chainId]
  return isLite ? null : curvejsApi.network.getVolume(requireLib<CurveApi>())
}

export const { useQuery: useAppStatsVolume } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsVolume', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsVolume,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
