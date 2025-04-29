import { curvejsValidationSuite } from '@/loan/entities/validation/curve-lending-js-validation'
import networks from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { useApiStore } from '@ui-kit/shared/useApiStore'

function _fetchAppStatsTotalCrvusdSupply({ chainId }: ChainQuery<ChainId>) {
  const curve = useApiStore.getState().stable!
  return networks[chainId].api.helpers.getTotalSupply(curve)
}

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsTotalCrvusdSupply,
  validationSuite: curvejsValidationSuite,
})
