import { useCallback } from 'react'
import type { WithdrawMutationContext, WithdrawMutationOptions } from '@/stellar/features/withdraw/types'
import { invalidateExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { withdrawValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import {
  fetchWithdrawSimulation,
  invalidateWithdrawSimulation,
} from '@/stellar/queries/withdraw/withdraw-simulation.query'
import type { WithdrawMutation } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { invalidatePoolLiquidity } from './invalidatePoolLiquidity'
import { useStellarMutation } from './useStellarMutation'

export const useWithdrawMutation = ({ onReset, tokens, expected, ...params }: WithdrawMutationOptions) => {
  const { network, pool, account } = params
  const { mutate, error, isPending } = useStellarMutation<WithdrawMutation, WithdrawMutationContext>({
    mutationKey: [{ network, pool, account, name: 'withdraw' }] as const,
    buildContext: (_, baseContext) => ({ ...baseContext, ...params, expected, tokens }) as WithdrawMutationContext,
    createTransaction: (values, context) => fetchWithdrawSimulation({ ...values, ...context }, { staleTime: 0 }),
    validationParams: { ...params, expected },
    validationSuite: withdrawValidationSuite,
    pendingMessage: () => t`Preparing withdrawal`,
    successMessage: () => t`Withdrawal confirmed`,
    onReset,
    onSuccess: async (_, values, context) => {
      const submitted = { ...values, ...context }
      await Promise.allSettled([
        invalidatePoolLiquidity(submitted),
        invalidateExpectedLp({
          ...submitted,
          isDeposit: false,
          isBalanced: submitted.mode === 'balanced',
          isExactBurn: submitted.mode !== 'unbalanced',
        }),
        invalidateWithdrawSimulation(submitted),
      ])
    },
  })
  const onSubmit = useCallback((values: DeepPartial<WithdrawMutation>) => mutate(values as WithdrawMutation), [mutate])
  return { onSubmit, mutate, error, isPending }
}
