import type { VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { curvejsApi as lib } from '@/dao/lib/curvejs'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import { decimal, ZERO } from '@evm-ui/utils'

async function _fetchLockerVecrvInfo({ userAddress }: ChainQuery<ChainId> & UserQuery) {
  const curve = requireLib('curveApi')
  const { resp } = await lib.lockCrv.vecrvInfo(curve, userAddress)
  return {
    ...resp,
    lockedAmountAndUnlockTime: {
      ...resp.lockedAmountAndUnlockTime,
      lockedAmount: decimal(resp.lockedAmountAndUnlockTime.lockedAmount) ?? ZERO,
    },
  } satisfies VecrvInfo
}

export const { useQuery: useLockerVecrvInfo, invalidate: invalidateLockerVecrvInfo } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & UserParams) =>
    ['locker-vecrv-info', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchLockerVecrvInfo,
  category: 'dao.user',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & UserParams) => {
    curveApiValidationGroup({ chainId: params.chainId })
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  }),
})
