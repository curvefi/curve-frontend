import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { UserChainParams, UserChainQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query'
import { curveApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'

const _fetchUserGaugeWeightVotes = async ({ userAddress }: UserChainQuery<ChainId>) => {
  const curve = requireLib('curveApi')
  const { gauges, powerUsed, veCrvUsed } = await curve.dao.userGaugeVotes(userAddress)
  return {
    powerUsed: Number(powerUsed),
    veCrvUsed: Number(veCrvUsed),
    gauges: gauges
      .map(gauge => ({
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
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      .sort((a, b) => b.userPower - a.userPower),
  }
}

export const { useQuery: useUserGaugeWeightVotesQuery, invalidate: invalidateUserGaugeWeightVotesQuery } = queryFactory(
  {
    queryKey: (params: UserChainParams<ChainId>) =>
      ['user-gauge-weight-votes', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
    queryFn: _fetchUserGaugeWeightVotes,
    category: 'dao.user',
    validationSuite: curveApiValidationSuite,
  },
)
