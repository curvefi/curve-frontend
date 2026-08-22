import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainQuery, UserQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite, type FieldsOf } from '@evm-ui/lib/validation'

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
    category: 'dao.user',
    validationSuite: createValidationSuite(({ chainId, userAddress, gaugeAddress }: UserGaugeParams) => {
      chainValidationGroup({ chainId })
      curveApiValidationGroup({ chainId })
      evmAddressValidationGroup({ evmAddress: userAddress })
      evmAddressValidationGroup({ evmAddress: gaugeAddress })
    }),
  })
