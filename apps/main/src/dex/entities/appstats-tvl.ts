import { curvejsApi } from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams } from '@evm-ui/queries/root-keys'
import { curveApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useAppStatsTvl } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => [{ name: 'appStatsTvl', chainId: params.chainId }] as const,
  queryFn: (_: ChainParams<ChainId>) => curvejsApi.network.getTVL(requireLib('curveApi')),
  validationSuite: curveApiValidationSuite,
  category: 'dex.appStats',
})
