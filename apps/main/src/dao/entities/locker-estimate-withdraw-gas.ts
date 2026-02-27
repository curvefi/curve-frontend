import { curvejsApi as lib } from '@/dao/lib/curvejs'
import type { ChainId } from '@/dao/types/dao.types'
import type { Address } from '@primitives/address.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { curveApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'

async function _fetchLockEstimateWithdrawGas({ userAddress }: ChainQuery<ChainId> & UserQuery) {
  const curve = requireLib('curveApi')
  const gasInfo = await lib.lockCrv.estGasWithdrawLockedCrv(curve, userAddress)
  const estimatedGasValue = gasInfo.estimatedGas
  return Array.isArray(estimatedGasValue) ? (estimatedGasValue?.[0] ?? 0) : estimatedGasValue
}

export const { useQuery: useLockEstimateWithdrawGas } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & UserParams) =>
    ['lock-estimate-withdraw-gas', { chainId: params.chainId }, { userAddress: params.userAddress }] as const,
  queryFn: _fetchLockEstimateWithdrawGas,
  category: 'user',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & { userAddress: Address }) => {
    curveApiValidationGroup({ chainId: params.chainId })
    userAddressValidationGroup({ userAddress: params.userAddress })
  }),
})
