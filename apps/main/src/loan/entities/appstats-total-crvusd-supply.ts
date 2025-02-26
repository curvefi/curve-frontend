import type { ChainId } from '@/loan/types/loan.types'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { curvejsValidationSuite } from '@/loan/entities/validation/curve-lending-js-validation'

function _fetchAppStatsTotalCrvusdSupply({ chainId }: ChainQuery<ChainId>) {
  const curve = useStore.getState().curve!
  return networks[chainId].api.helpers.getTotalSupply(curve)
}

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsTotalCrvusdSupply,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
