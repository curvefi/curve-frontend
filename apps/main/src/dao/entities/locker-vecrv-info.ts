import lib from '@/dao/lib/curvejs'
import type { ChainId, CurveApi } from '@/dao/types/dao.types'
import type { Address } from '@curvefi/prices-api'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userValidationGroup } from '@ui-kit/lib/model/query/user-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { curvejsValidationGroup } from './validation/curvejs-validation'

async function _fetchLockerVecrvInfo({ chainId, walletAddress }: ChainQuery<ChainId> & { walletAddress: Address }) {
  const curve = requireLib<CurveApi>()

  return (await lib.lockCrv.vecrvInfo(curve, walletAddress)).resp
}

export const { useQuery: useLockerVecrvInfo, invalidate: invalidateLockerVecrvInfo } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & { walletAddress: Address }) =>
    ['locker-vecrv-info', { chainId: params.chainId }, { walletAddress: params.walletAddress }] as const,
  queryFn: _fetchLockerVecrvInfo,
  staleTime: '1m',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & { walletAddress: Address }) => {
    curvejsValidationGroup({ chainId: params.chainId })
    userValidationGroup({ userAddress: params.walletAddress })
  }),
})
