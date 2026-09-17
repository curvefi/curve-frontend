import { useCallback } from 'react'
import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { rootKeys, type PoolQuery } from '@/stellar/queries/root-keys'
import { fetchSwapSimulation, invalidateSwapSimulation } from '@/stellar/queries/swap/swap-simulation.query'
import { swapMutationValidationSuite, type SwapMutation } from '@/stellar/queries/validation/swap.validation'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { t } from '@ui/lib/i18n'
import { invalidatePoolLiquidity } from './invalidatePoolLiquidity'
import { useStellarMutation } from './useStellarMutation'

type SwapOptions = PoolQuery & { account: StellarAddress | undefined; tokens: StellarContract[]; onReset: () => void }

export const useSwapMutation = ({ tokens, onReset, ...params }: SwapOptions) => {
  const { mutate, error, isPending } = useStellarMutation<SwapMutation>({
    mutationKey: [...rootKeys.userPool(params), 'swap'],
    createTransaction: (values, { account }) =>
      fetchSwapSimulation({ ...values, ...params, account }, { staleTime: 0 }),
    validationSuite: swapMutationValidationSuite,
    validationParams: params,
    pendingMessage: () => t`Preparing swap`,
    successMessage: () => t`Swap confirmed`,
    onReset,
    onSuccess: async (_, values, { account }) => {
      const submitted = { ...values, ...params, account }
      await Promise.allSettled([
        invalidatePoolLiquidity({ ...submitted, tokens }),
        // Both quote directions and small reference trades depend on the changed reserves.
        queryClient.invalidateQueries({ queryKey: [...rootKeys.pool(submitted), 'swap-quote'] }),
        invalidateSwapSimulation(submitted),
      ])
    },
  })
  const onSubmit = useCallback((values: SwapFormValues) => mutate(values as SwapMutation), [mutate])
  return { onSubmit, mutate, error, isPending }
}
