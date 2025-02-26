import type { ChainId } from '@/dex/types/main.types'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import { curvejsValidationSuite } from './validation/curvejs-validation'

async function _fetchAppStatsVolume({ chainId }: ChainQuery<ChainId>) {
  const curve = useStore.getState().curve
  const networks = useStore.getState().networks.networks
  const { isLite } = networks[chainId]
  if (isLite) return null

  const { getVolume } = curvejsApi.network
  return getVolume(curve)
}

export const { useQuery: useAppStatsVolume } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsVolume', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsVolume,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
