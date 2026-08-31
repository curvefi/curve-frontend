import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys, type UserChainParams, type UserChainQuery } from '@evm-ui/lib/model/query'
import { curveApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'

const _fetchUserGaugeWeightVotes = async ({ userAddress }: UserChainQuery<ChainId>) => {
  const { gauges, powerUsed, veCrvUsed } = await requireLib('curveApi').dao.userGaugeVotes(userAddress)
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
    queryKey: ({ chainId, userAddress }: UserChainParams<ChainId>) =>
      [...rootKeys.userChain({ chainId, userAddress }), 'dao.userGaugeVotes'] as const,
    queryFn: _fetchUserGaugeWeightVotes,
    category: 'dao.user',
    validationSuite: curveApiValidationSuite,
  },
)
