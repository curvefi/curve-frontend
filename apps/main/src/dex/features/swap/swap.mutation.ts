import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { usePoolMutation } from '@/dex/mutations/usePoolMutation'
import { fetchSwapIsApproved } from '@/dex/queries/swap/swap-approved.query'
import type { PoolQuery } from '@evm-ui/queries/query-types'
import { waitForApproval } from '@evm-ui/utils'
import type { Hex } from '@primitives/address.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { t } from '@ui/lib/i18n'
import { swapMutationValidationSuite } from './swap.validation'
import type { SwapMutation } from './types'

export const useSwapMutation = ({ chainId, poolAddress, onReset }: PoolQuery & { onReset: () => void }) => {
  const { address: userAddress } = useConnection()
  const config = useConfig()
  const { mutate, error, isPending } = usePoolMutation<SwapMutation>({
    chainId,
    poolAddress,
    mutationKey: [{ name: 'swap', chainId, poolAddress, userAddress }] as const,
    mutationFn: async (values, { pool, userAddress }) => {
      const { isWrapped, fromIndex, toIndex, inputAmount, slippage } = values
      await waitForApproval({
        isApproved: async () =>
          await fetchSwapIsApproved({ ...values, chainId, poolAddress, userAddress }, { staleTime: 0 }),
        onApprove: async () => (await pool[`swap${wrappedMethod(isWrapped)}Approve`](fromIndex, inputAmount)) as Hex[],
        message: t`Approved swap`,
        config,
      })
      // Curve.js derives the execution minimum from slippage when preparing the transaction.
      return {
        hash: (await pool[`swap${wrappedMethod(isWrapped)}`](fromIndex, toIndex, inputAmount, +slippage)) as Hex,
      }
    },
    pendingMessage: () => t`Swapping...`,
    successMessage: () => t`Swap successful!`,
    validationSuite: swapMutationValidationSuite,
    onReset,
  })
  const onSubmit = useCallback((values: SwapFormValues) => mutate(values as SwapMutation), [mutate])
  return { onSubmit, mutate, error, isPending }
}
