import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

// There might be some overlap with locker-vecrv-info, but need to investigate and
// refactor that at a later time.
export const { useQuery: useLockerVecrvUser, invalidate: invalidateLockerVecrvUser } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & UserParams) =>
    ['locker-vecrv-user', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: async ({ userAddress }: ChainQuery<ChainId> & UserQuery) => {
    const curve = requireLib('curveApi')
    return await curve.dao.userVeCrv(userAddress)
  },
  staleTime: '1m',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & UserParams) => {
    curveApiValidationGroup({ chainId: params.chainId })
    userAddressValidationGroup({ userAddress: params.userAddress })
  }),
})
