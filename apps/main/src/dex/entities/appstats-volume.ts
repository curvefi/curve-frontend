import { curvejsApi } from '@/dex/lib/curvejs'
import type { ChainId } from '@/dex/types/main.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { fetchNetworks } from './networks'

async function _fetchAppStatsVolume({ chainId }: ChainQuery<ChainId>) {
  const networks = await fetchNetworks()
  const { isLite } = networks[chainId] ?? {}
  return isLite ? null : curvejsApi.network.getVolume(requireLib('curveApi'))
}

export const { useQuery: useAppStatsVolume } = queryFactory({
  queryKey: (params: ChainParams<ChainId>) => ['appStatsVolume', { chainId: params.chainId }] as const,
  queryFn: _fetchAppStatsVolume,
  validationSuite: curveApiValidationSuite,
  category: 'dex.appStats',
})
