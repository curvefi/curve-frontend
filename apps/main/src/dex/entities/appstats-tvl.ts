import type { ChainId } from '@/dex/types/main.types'
import { queryFactory } from '@ui-kit/lib/model/query'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import { curvejsValidationSuite } from './validation/curvejs-validation'

async function _fetchAppStatsTvl({ chainId }: { chainId: ChainId | null }) {
  const curve = useStore.getState().curve

  const { getTVL } = curvejsApi.network
  return getTVL(curve)
}

export const { useQuery: useAppStatsTvl } = queryFactory({
  queryKey: (params: { chainId: ChainId }) => ['appStatsTvl', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsTvl,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
