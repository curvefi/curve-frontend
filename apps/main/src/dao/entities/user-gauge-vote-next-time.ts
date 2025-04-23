import { curvejsValidationSuite } from '@/dao/entities/validation/curvejs-validation'
import type { ChainId } from '@/dao/types/dao.types'
import { getLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { CurveApi } from '@ui-kit/shared/useApiStore'

const _fetchUserGaugeVoteNextTime = async ({
  chainId,
  gaugeAddress,
  userAddress,
  enabled,
}: ChainQuery<ChainId> & { gaugeAddress: string; userAddress: string; enabled: boolean }) => {
  if (!enabled) return null
  const curve = getLib<CurveApi>()

  return await curve!.dao.voteForGaugeNextTime(gaugeAddress)
}

export const { useQuery: useUserGaugeVoteNextTimeQuery, invalidate: invalidateUserGaugeVoteNextTimeQuery } =
  queryFactory({
    queryKey: (params: ChainParams<ChainId> & { gaugeAddress: string; userAddress: string; enabled: boolean }) =>
      [
        'user-gauge-vote-next-time',
        { chainId: params.chainId },
        { gaugeAddress: params.gaugeAddress },
        { userAddress: params.userAddress },
        { enabled: params.enabled },
      ] as const,
    queryFn: _fetchUserGaugeVoteNextTime,
    validationSuite: curvejsValidationSuite,
  })
