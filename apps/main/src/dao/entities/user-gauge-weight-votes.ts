import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { UserChainParams, UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

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
    queryKey: ({ chainId, userAddress }: UserChainParams<ChainId>) =>
      ({ name: 'user-gauge-weight-votes', chainId, userAddress }) as const,
    queryFn: _fetchUserGaugeWeightVotes,
    category: 'dao.user',
    validationSuite: createValidationSuite((params: UserChainParams<ChainId>) => {
      chainValidationGroup(params)
      curveApiValidationGroup(params)
      userAddressValidationGroup(params)
    }),
  },
)
