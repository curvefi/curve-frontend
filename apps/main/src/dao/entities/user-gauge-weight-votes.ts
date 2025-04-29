import { curvejsValidationSuite } from '@/dao/entities/validation/curvejs-validation'
import type { ChainId } from '@/dao/types/dao.types'
import { getLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { CurveApi } from '@ui-kit/shared/useApiStore'

const _fetchUserGaugeWeightVotes = async ({ chainId, userAddress }: ChainQuery<ChainId> & { userAddress: string }) => {
  const curve = getLib<CurveApi>()

  const gaugeVoteWeightsRes = await curve!.dao.userGaugeVotes(userAddress)

  const data = {
    powerUsed: Number(gaugeVoteWeightsRes.powerUsed),
    veCrvUsed: Number(gaugeVoteWeightsRes.veCrvUsed),
    gauges: gaugeVoteWeightsRes.gauges
      .map((gauge) => ({
        userPower: Number(gauge.userPower),
        userVeCrv: Number(gauge.userVeCrv),
        userFutureVeCrv: Number(gauge.userFutureVeCrv),
        expired: gauge.expired,
        ...gauge.gaugeData,
        rootGaugeAddress: '',
        relativeWeight: Number(gauge.gaugeData.relativeWeight),
        totalVeCrv: Number(gauge.gaugeData.totalVeCrv),
        nextVoteTime: null,
        canVote: true,
      }))
      .sort((a, b) => b.userPower - a.userPower),
  }

  return data
}

export const {
  useQuery: useUserGaugeWeightVotesQuery,
  invalidate: invalidateUserGaugeWeightVotesQuery,
  getQueryData: getUserGaugeWeightVotesQueryData,
} = queryFactory({
  queryKey: (params: ChainParams<ChainId> & { userAddress: string }) =>
    ['user-gauge-weight-votes', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserGaugeWeightVotes,
  validationSuite: curvejsValidationSuite,
})
