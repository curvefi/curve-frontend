import type { Curve } from '@/loan/types/loan.types'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib'
import networks from '@/loan/networks'

async function _fetchAppStatsTotalCrvusdSupply({ curve }: { curve: Curve | null }) {
  if (!curve) return null
  const chainId = curve.chainId

  const fetchedTotalSupply = await networks[chainId].api.helpers.getTotalSupply(curve)
  return fetchedTotalSupply
}

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: (params: { curve: Curve | null }) => ['appStatsTvl', { curve: params.curve }] as const,
  queryFn: _fetchAppStatsTotalCrvusdSupply,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
