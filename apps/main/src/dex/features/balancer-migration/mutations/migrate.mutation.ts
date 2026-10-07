import { useCallback } from 'react'
import { erc20Abi } from 'viem'
import { useConfig } from 'wagmi'
import { approve, fetchHasEnoughAllowance } from '@evm-ui/queries/allowance.query'
import { useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'
import { readContract, sendTransaction } from '@wagmi/core'
import { invalidateBalancerPositions } from '../queries/balancer-positions.query'
import {
  fetchMigrationQuote,
  migrationQuoteValidationSuite,
  type MigrationQuoteQuery,
} from '../queries/migration-quote.query'

export type MigrateVariables = Omit<MigrationQuoteQuery, 'userAddress'> & { label: string }

type MigrateOptions = { chainId: number; userAddress: Address | undefined; onReset: () => void }

export const useMigrateMutation = ({ chainId, userAddress, onReset }: MigrateOptions) => {
  const config = useConfig()
  const { mutate, error, isPending } = useEvmMutation<MigrateVariables>({
    mutationKey: [{ chainId, name: 'balancerMigration' }] as const,
    mutationFn: async ({ label: _, ...variables }) => {
      if (!userAddress) throw new Error('Wallet not connected')
      const amount = BigInt(variables.amountIn)
      const { tokenIn } = variables

      const balance = await readContract(config, {
        chainId,
        address: tokenIn,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      })
      if (balance < amount) throw new Error(t`Balancer LP balance changed, refresh the quote`)

      // Fresh quote right before signing: the calldata carries Enso's minAmountOut, which reverts on worse execution.
      const { tx } = await fetchMigrationQuote({ ...variables, userAddress }, { staleTime: 0 })

      await waitForApproval({
        isApproved: () =>
          fetchHasEnoughAllowance(config, {
            amount,
            chainId,
            userAddress,
            tokenAddress: tokenIn,
            spenderAddress: tx.to,
          }),
        onApprove: () => approve(config, { amount, chainId, tokenAddress: tokenIn, spenderAddress: tx.to }),
        message: t`Approved Balancer LP for migration`,
        config,
      })

      return { hash: await sendTransaction(config, { chainId, to: tx.to, data: tx.data, value: BigInt(tx.value) }) }
    },
    validationSuite: migrationQuoteValidationSuite,
    validationParams: { chainId },
    pendingMessage: ({ label }) => t`Migrating ${label} to Curve...`,
    successMessage: ({ label }) => t`Migrated ${label} to Curve`,
    onReset: () => {
      if (userAddress) void invalidateBalancerPositions({ chainId, userAddress })
      onReset()
    },
  })

  const onSubmit = useCallback((variables: MigrateVariables) => mutate(variables), [mutate])

  return { onSubmit, error, isPending }
}
