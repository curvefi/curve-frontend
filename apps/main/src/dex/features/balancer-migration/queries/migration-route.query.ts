import { getWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-config'
import { fetchHasEnoughAllowance } from '@evm-ui/queries/allowance.query'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { toArray } from '@primitives/array.utils'
import { assert, maybe } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery, q } from '@ui/features/queries/util'
import { toWei } from '@ui/lib/decimal'
import { fetchMigrationRoute } from '../api/migration-route.api'
import { type MigrationParams, type MigrationQuery, migrationQueryValidationSuite } from '../migration.validation'

/** Balancer pool tokens and Curve LP tokens both use 18 decimals. */
export const LP_DECIMALS = 18

export const { useQuery: useMigrationRoute, fetchQuery: fetchMigrationRouteQuery } = queryFactory({
  queryKey: ({ chainId, userAddress, tokenIn, tokenOut, amount, slippage }: MigrationParams) =>
    ({ name: 'balancerMigration.route', chainId, userAddress, tokenIn, tokenOut, amount, slippage }) as const,
  queryFn: ({ amount, ...params }: MigrationQuery) =>
    fetchMigrationRoute({ ...params, amountIn: toWei(amount, LP_DECIMALS) }),
  category: 'dex.deposit',
  validationSuite: migrationQueryValidationSuite,
})

/** Approval is to the Enso router returned with the route, for the exact amount. */
export const { useQuery: useMigrationIsApproved } = queryFactory({
  queryKey: ({ chainId, userAddress, tokenIn, tokenOut, amount, slippage }: MigrationParams) =>
    ({ name: 'balancerMigration.isApproved', chainId, userAddress, tokenIn, tokenOut, amount, slippage }) as const,
  queryFn: async (params: MigrationQuery) => {
    const { tx } = await fetchMigrationRouteQuery(params)
    return await fetchHasEnoughAllowance(assert(getWagmiConfig(), 'Wagmi config is not initialized'), {
      chainId: params.chainId,
      userAddress: params.userAddress,
      tokenAddress: params.tokenIn,
      spenderAddress: tx.to,
      amount: BigInt(toWei(params.amount, LP_DECIMALS)),
    })
  },
  category: 'dex.deposit',
  validationSuite: migrationQueryValidationSuite,
})

/** Gas of the migration transaction from the Enso simulation; the approval is not included. */
export const useMigrationEstimateGas = createEstimateGasHook((params: MigrationParams, enabled?: boolean) =>
  mapQuery(q(useMigrationRoute(params, enabled)), ({ gas }) => maybe(toArray(gas)[0], Number)),
)
