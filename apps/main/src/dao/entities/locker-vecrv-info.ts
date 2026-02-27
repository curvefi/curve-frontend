import { curvejsApi as lib } from '@/dao/lib/curvejs'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

async function _fetchLockerVecrvInfo({ userAddress }: ChainQuery<ChainId> & UserQuery) {
  const curve = requireLib('curveApi')
  const { resp } = await lib.lockCrv.vecrvInfo(curve, userAddress)
  return resp
}

export const { useQuery: useLockerVecrvInfo, invalidate: invalidateLockerVecrvInfo } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & UserParams) =>
    ['locker-vecrv-info', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchLockerVecrvInfo,
  category: 'dao.user',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & UserParams) => {
    curveApiValidationGroup({ chainId: params.chainId })
    userAddressValidationGroup({ userAddress: params.userAddress })
  }),
})
