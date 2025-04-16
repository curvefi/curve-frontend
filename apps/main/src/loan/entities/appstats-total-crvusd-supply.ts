import { curvejsValidationSuite } from '@/loan/entities/validation/curve-lending-js-validation'
import networks from '@/loan/networks'
import { requireStablecoin } from '@/loan/temp-lib'
import type { ChainId } from '@/loan/types/loan.types'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: ({ chainId }: ChainQuery<ChainId>) => networks[chainId].api.helpers.getTotalSupply(requireStablecoin()),
  validationSuite: curvejsValidationSuite,
})
