import type { CurveApi } from '@/dex/types/main.types'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'

async function _fetchAppStatsVolume({ curve }: { curve: CurveApi | null }) {
  if (!curve) return null

  const chainId = curve.chainId
  const networks = useStore.getState().networks.networks
  const { isLite } = networks[chainId]
  if (isLite) return null

  const { getVolume } = curvejsApi.network
  return getVolume(curve)
}

export const { useQuery: useAppStatsVolume } = queryFactory({
  queryKey: (params: { curve: CurveApi | null }) => ['appStatsVolume', { curve: params.curve }] as const,
  queryFn: _fetchAppStatsVolume,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
