import { curvejsApi as lib } from '@/dao/lib/curvejs'
import type { ChainId } from '@/dao/types/dao.types'
import type { Address } from '@primitives/address.utils'
import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams, ChainQuery, UserParams, UserQuery } from '@evm-ui/lib/model/query'
import { queryFactory } from '@evm-ui/lib/model/query'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'

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
  category: 'dao.user',
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & { userAddress: Address }) => {
    curveApiValidationGroup({ chainId: params.chainId })
    evmAddressValidationGroup({ evmAddress: params.userAddress })
  }),
})
