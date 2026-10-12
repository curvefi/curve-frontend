import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { fetchTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { approve, fetchHasEnoughAllowance } from '@evm-ui/queries/allowance.query'
import { useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { toWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { sendTransaction } from '@wagmi/core'
import { migrationQueryValidationSuite } from '../migration.validation'
import { invalidateBalancerPositions } from '../queries/balancer-positions.query'
import { fetchMigrationRouteQuery, LP_DECIMALS } from '../queries/migration-route.query'

export type MigrateVariables = { tokenOut: Address; amount: Decimal; slippage: Decimal }

type MigrateOptions = {
  chainId: number
  userAddress: Address | undefined
  tokenIn: Address
  poolName: string
  onReset: () => void
}

export const useMigrateMutation = ({ chainId, userAddress, tokenIn, poolName, onReset }: MigrateOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useEvmMutation<MigrateVariables>({
    mutationKey: [{ chainId, tokenIn, name: 'balancerMigration' }] as const,
    mutationFn: async ({ tokenOut, amount, slippage }) => {
      if (!userAddress) throw new Error('Wallet not connected')
      const amountIn = BigInt(toWei(amount, LP_DECIMALS))
      const balance = await fetchTokenBalance(config, { chainId, userAddress, tokenAddress: tokenIn })
      if (BigInt(toWei(balance, LP_DECIMALS)) < amountIn)
        throw new Error(t`Balancer LP balance changed, refresh the quote`)

      // Fresh quote right before signing: the calldata carries Enso's minAmountOut, which reverts on worse execution.
      const params = { chainId, userAddress, tokenIn, tokenOut, amount, slippage }
      const { tx } = await fetchMigrationRouteQuery(params, { staleTime: 0 })

      await waitForApproval({
        isApproved: () =>
          fetchHasEnoughAllowance(config, {
            amount: amountIn,
            chainId,
            userAddress,
            tokenAddress: tokenIn,
            spenderAddress: tx.to,
          }),
        onApprove: () => approve(config, { amount: amountIn, chainId, tokenAddress: tokenIn, spenderAddress: tx.to }),
        message: t`Approved Balancer LP for migration`,
        config,
      })

      return { hash: await sendTransaction(config, { chainId, to: tx.to, data: tx.data, value: BigInt(tx.value) }) }
    },
    validationSuite: migrationQueryValidationSuite,
    validationParams: { chainId, tokenIn },
    pendingMessage: () => t`Migrating ${poolName} to Curve...`,
    successMessage: () => t`Migrated ${poolName} to Curve`,
    onReset: () => {
      if (userAddress) void invalidateBalancerPositions({ chainId, userAddress })
      onReset()
    },
  })

  const onSubmit = useCallback(
    ({ tokenOut, amount, slippage }: { tokenOut?: Address; amount?: Decimal; slippage: Decimal }) =>
      mutate({ tokenOut: tokenOut!, amount: amount!, slippage }),
    [mutate],
  )

  return { onSubmit, error, isPending }
}
