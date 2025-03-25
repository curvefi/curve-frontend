import curvejsApi from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { useApiStore } from '@ui-kit/shared/useApiStore'
import { curvejsValidationSuite } from './validation/curvejs-validation'

async function _fetchAppStatsTvl(_: ChainParams<ChainId>) {
  const curve = useApiStore.getState().curve!

  const { getTVL } = curvejsApi.network
  return getTVL(curve)
}

export const { useQuery: useAppStatsTvl } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTvl', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsTvl,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
