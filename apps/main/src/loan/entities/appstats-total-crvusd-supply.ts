import type { ChainId } from '@/loan/types/loan.types'
import { ChainParams } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { curvejsValidationSuite } from '@/loan/entities/validation/curve-lending-js-validation'

async function _fetchAppStatsTotalCrvusdSupply({ chainId }: ChainParams<ChainId>) {
  const curve = useStore.getState().curve
  if (!curve || !chainId) return null

  const fetchedTotalSupply = await networks[chainId].api.helpers.getTotalSupply(curve)
  return fetchedTotalSupply
}

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsTotalCrvusdSupply', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsTotalCrvusdSupply,
  staleTime: '5m',
  validationSuite: curvejsValidationSuite,
})
