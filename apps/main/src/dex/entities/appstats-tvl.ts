import { curvejsApi } from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useAppStatsTvl } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTvl', { chainId: params.chainId }] as const,
  queryFn: (_: ChainParams<ChainId>) => curvejsApi.network.getTVL(requireLib('curveApi')),
  validationSuite: curveApiValidationSuite,
  category: 'detail',
})
