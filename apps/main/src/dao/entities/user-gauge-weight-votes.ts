import { curvejsValidationSuite } from '@/dao/entities/validation/curvejs-validation'
import type { ChainId, CurveApi } from '@/dao/types/dao.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'

const _fetchUserGaugeWeightVotes = async ({ userAddress }: ChainQuery<ChainId> & { userAddress: string }) => {
  const curve = requireLib<CurveApi>()
  const { gauges, powerUsed, veCrvUsed } = await curve.dao.userGaugeVotes(userAddress)
  return {
    powerUsed: Number(powerUsed),
    veCrvUsed: Number(veCrvUsed),
    gauges: gauges
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
}

export const { useQuery: useUserGaugeWeightVotesQuery, invalidate: invalidateUserGaugeWeightVotesQuery } = queryFactory(
  {
    queryKey: (params: ChainParams<ChainId> & { userAddress: string }) =>
      ['user-gauge-weight-votes', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
    queryFn: _fetchUserGaugeWeightVotes,
    validationSuite: curvejsValidationSuite,
  },
)
