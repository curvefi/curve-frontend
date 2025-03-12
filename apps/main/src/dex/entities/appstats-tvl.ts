import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curvejsValidationSuite } from './validation/curvejs-validation'

async function _fetchAppStatsTvl(_: ChainParams<ChainId>) {
  const curve = useStore.getState().curve

  const { getTVL } = curvejsApi.network
  return getTVL(curve)
}

export const { useQuery: useAppStatsTvl } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTvl', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsTvl,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
