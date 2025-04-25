import { enforce, group, test } from 'vest'
import { chainValidationGroup, curvejsValidationGroup } from '@/dao/entities/validation/curvejs-validation'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { CurveApi } from '@ui-kit/shared/useApiStore'

export const userGaugeVoteNextTimeValidationGroup = ({ enabled }: { enabled: boolean }) =>
  group('userGaugeVoteNextTimeEnabled', () => {
    test('enabled', () => {
      enforce(enabled).message('Enabled should be true')
    })
  })

type QueryParams = ChainQuery<ChainId> & { gaugeAddress: string; userAddress: string; enabled: boolean }
type QueryKeyParams = ChainParams<ChainId> & { gaugeAddress: string; userAddress: string; enabled: boolean }

const _fetchUserGaugeVoteNextTime = ({ gaugeAddress, enabled }: QueryParams) =>
  requireLib<CurveApi>().dao.voteForGaugeNextTime(gaugeAddress)

export const { useQuery: useUserGaugeVoteNextTimeQuery, invalidate: invalidateUserGaugeVoteNextTimeQuery } =
  queryFactory({
    queryKey: (params: QueryKeyParams) =>
      [
        'user-gauge-vote-next-time',
        { chainId: params.chainId },
        { gaugeAddress: params.gaugeAddress },
        { userAddress: params.userAddress },
        { enabled: params.enabled },
      ] as const,
    queryFn: _fetchUserGaugeVoteNextTime,
    validationSuite: createValidationSuite((params: QueryKeyParams) => {
      chainValidationGroup(params)
      curvejsValidationGroup(params)
      userGaugeVoteNextTimeValidationGroup(params)
    }),
  })
