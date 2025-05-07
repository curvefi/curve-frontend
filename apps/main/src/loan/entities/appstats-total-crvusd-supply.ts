import { curvejsValidationSuite } from '@/loan/entities/validation/curve-lending-js-validation'
import networks from '@/loan/networks'
import type { ChainId, LlamaApi } from '@/loan/types/loan.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: ({ chainId }: ChainQuery<ChainId>) => networks[chainId].api.helpers.getTotalSupply(requireLib<LlamaApi>()),
  validationSuite: curvejsValidationSuite,
})
