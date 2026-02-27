import { enforce, group, test } from 'vest'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainQuery, UserQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib/validation'

type UserGaugeQuery = ChainQuery<ChainId> & UserQuery<string> & { gaugeAddress: string }
type UserGaugeParams = FieldsOf<UserGaugeQuery>

export const { useQuery: useUserGaugeVoteNextTimeQuery, invalidate: invalidateUserGaugeVoteNextTimeQuery } =
  queryFactory({
    queryKey: (params: UserGaugeParams) =>
      [
        'user-gauge-vote-next-time',
        { chainId: params.chainId },
        { gaugeAddress: params.gaugeAddress },
        { userAddress: params.userAddress },
      ] as const,
    queryFn: ({ gaugeAddress }: UserGaugeQuery) => requireLib('curveApi').dao.voteForGaugeNextTime(gaugeAddress),
    category: 'user',
    validationSuite: createValidationSuite(({ chainId, userAddress, gaugeAddress }: UserGaugeParams) => {
      chainValidationGroup({ chainId })
      curveApiValidationGroup({ chainId })
      userAddressValidationGroup({ userAddress })
      group('gaugeValidation', () => {
        test('gaugeAddress', () => {
          enforce(gaugeAddress).message('Gauge address is required')
        })
      })
    }),
  })
