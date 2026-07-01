import { SCRVUSD_GAS_ESTIMATE } from '@/loan/constants'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { BaseConfig } from '@ui/utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { useEstimateGas } from '@ui-kit/lib/model/entities/gas-info'
import { useScrvUsdDepositIsApproved } from './scrvusd-deposit-is-approved.query'
import { useScrvUsdUserBalances } from './scrvusd-userBalances.query'
import type { ScrvUsdDepositParams, ScrvUsdDepositQuery } from './scrvusd.validation'
import { scrvUsdDepositMaxValidationSuite } from './scrvusd.validation'

const { useQuery: useScrvUsdDepositApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) =>
    [
      ...rootKeys.userChain({ chainId, userAddress }),
      'st_crvUSD.estimateGas.depositApprove',
      { depositAmount },
    ] as const,
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    await requireLib('llamaApi').st_crvUSD.estimateGas.depositApprove(depositAmount),
  category: 'savings.user',
  validationSuite: scrvUsdDepositMaxValidationSuite,
})

const { useQuery: useScrvUsdDepositEstimateGasQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, depositAmount }: ScrvUsdDepositParams) =>
    [...rootKeys.userChain({ chainId, userAddress }), 'st_crvUSD.estimateGas.deposit', { depositAmount }] as const,
  queryFn: async ({ depositAmount }: ScrvUsdDepositQuery) =>
    await requireLib('llamaApi').st_crvUSD.estimateGas.deposit(depositAmount),
  category: 'savings.user',
  validationSuite: scrvUsdDepositMaxValidationSuite,
})

const estimateDepositGas = ({ scrvUSD }: { scrvUSD: Decimal }) =>
  +scrvUSD ? SCRVUSD_GAS_ESTIMATE.FOLLOWING_DEPOSIT : SCRVUSD_GAS_ESTIMATE.FIRST_DEPOSIT

export const useScrvUsdDepositEstimateGas = (
  networks: Record<number, BaseConfig>,
  query: ScrvUsdDepositParams,
  enabled = true,
) => {
  const {
    data: isApproved,
    isLoading: isApprovedLoading,
    error: isApprovedError,
  } = useScrvUsdDepositIsApproved(query, enabled)
  const {
    data: approveEstimate,
    isLoading: approveLoading,
    error: approveError,
  } = useScrvUsdDepositApproveEstimateGas(query, enabled && isApproved === false)
  const {
    data: actionEstimate,
    isLoading: actionLoading,
    error: actionError,
  } = useScrvUsdDepositEstimateGasQuery(query, enabled && isApproved === true)
  const {
    data: userBalances,
    isLoading: userBalancesLoading,
    error: userBalancesError,
  } = useScrvUsdUserBalances(query, enabled && isApproved === false)

  const gasEstimate = isApproved
    ? actionEstimate
    : maybes([approveEstimate, userBalances], (estimate, balances) => +estimate + estimateDepositGas(balances))
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas(networks, query.chainId, gasEstimate, enabled && gasEstimate != null)

  return {
    data,
    isLoading: [
      isApprovedLoading,
      approveLoading,
      actionLoading,
      userBalancesLoading && isApproved === false,
      conversionLoading,
    ].some(Boolean),
    error: [isApprovedError, approveError, actionError, userBalancesError, estimateError].find(Boolean) ?? null,
  }
}
