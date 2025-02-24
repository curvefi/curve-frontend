import type { CurveApi } from '@/dex/types/main.types'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib'
import curvejsApi from '@/dex/lib/curvejs'

async function _fetchAppStatsTvl({ curve }: { curve: CurveApi | null }) {
  if (!curve) return null

  const { getTVL } = curvejsApi.network
  return getTVL(curve)
}

export const { useQuery: useAppStatsTvl } = queryFactory({
  queryKey: (params: { curve: CurveApi | null }) => ['appStatsTvl', { curve: params.curve }] as const,
  queryFn: _fetchAppStatsTvl,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
