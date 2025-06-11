import lib from '@/dao/lib/curvejs'
import type { ChainId, CurveApi } from '@/dao/types/dao.types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { curvejsValidationGroup } from './validation/curvejs-validation'

async function _fetchLockerVecrvInfo({ userAddress }: ChainQuery<ChainId> & UserQuery) {
  const curve = requireLib<CurveApi>()

  const { resp } = await lib.lockCrv.vecrvInfo(curve, userAddress)
  return resp
}

export const { useQuery: useLockerVecrvInfo, invalidate: invalidateLockerVecrvInfo } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & UserParams) =>
    ['locker-vecrv-info', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchLockerVecrvInfo,
  staleTime: '1m',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & UserParams) => {
    curvejsValidationGroup({ chainId: params.chainId })
    userAddressValidationGroup({ userAddress: params.userAddress })
  }),
})
