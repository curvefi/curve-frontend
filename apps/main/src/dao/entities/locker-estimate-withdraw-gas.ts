import lib from '@/dao/lib/curvejs'
import type { ChainId, CurveApi } from '@/dao/types/dao.types'
import type { Address } from '@curvefi/prices-api'
import { requireLib } from '@ui-kit/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query'
import { userValidationGroup } from '@ui-kit/lib/model/query/user-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { curvejsValidationGroup } from './validation/curvejs-validation'

async function _fetchLockEstimateWithdrawGas({
  chainId,
  walletAddress,
}: ChainQuery<ChainId> & { walletAddress: Address }) {
  const curve = requireLib<CurveApi>()

  const gasInfo = await lib.lockCrv.estGasWithdrawLockedCrv(curve, walletAddress)
  const estimatedGasValue = gasInfo.estimatedGas

  if (Array.isArray(estimatedGasValue)) {
    return estimatedGasValue.length > 0 ? estimatedGasValue[0] : 0
  }
  return estimatedGasValue
}

export const { useQuery: useLockEstimateWithdrawGas, invalidate: invalidateLockEstimateWithdrawGas } = queryFactory({
  queryKey: (params: ChainParams<ChainId> & { walletAddress: Address }) =>
    ['lock-estimate-withdraw-gas', { chainId: params.chainId }, { walletAddress: params.walletAddress }] as const,
  queryFn: _fetchLockEstimateWithdrawGas,
  validationSuite: createValidationSuite((params: ChainParams<ChainId> & { walletAddress: Address }) => {
    curvejsValidationGroup({ chainId: params.chainId })
    userValidationGroup({ userAddress: params.walletAddress })
  }),
})
