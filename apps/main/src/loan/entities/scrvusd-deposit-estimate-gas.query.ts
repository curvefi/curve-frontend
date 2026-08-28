import { SCRVUSD_GAS_ESTIMATE } from '@/loan/constants'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { combineQueries, pickQuery } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { useEstimateGas } from '@evm-ui/lib/model/entities/gas-info'
import type { BaseConfig } from '@legacy-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
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
  const isApproved = useScrvUsdDepositIsApproved(query, enabled)
  const approveEstimate = useScrvUsdDepositApproveEstimateGas(query, enabled && isApproved.data === false)
  const actionEstimate = useScrvUsdDepositEstimateGasQuery(query, enabled && isApproved.data === true)
  const userBalances = useScrvUsdUserBalances(query, enabled && isApproved.data === false)

  const firstDepositEstimate = combineQueries(
    [approveEstimate, userBalances],
    (estimate, balances) => +estimate + estimateDepositGas(balances),
  )
  const estimate = pickQuery([actionEstimate, firstDepositEstimate], ([action, firstDeposit]) =>
    isApproved.data ? action : firstDeposit,
  )

  const gas = useEstimateGas(networks, query.chainId, estimate, enabled)

  return combineQueries([isApproved, gas], (_, gas) => gas)
}
