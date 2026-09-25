import { useCallback } from 'react'
import type { WithdrawMutationContext, WithdrawMutationOptions } from '@/stellar/features/withdraw/types'
import { invalidateExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { rootKeys } from '@/stellar/queries/root-keys'
import { withdrawValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import {
  fetchWithdrawSimulation,
  invalidateWithdrawSimulation,
} from '@/stellar/queries/withdraw/withdraw-simulation.query'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues, WithdrawMutation } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { t } from '@ui/lib/i18n'
import { invalidatePoolLiquidity } from './invalidatePoolLiquidity'
import { useStellarMutation } from './useStellarMutation'

export const useWithdrawMutation = ({ onReset, tokens, quote, ...params }: WithdrawMutationOptions) => {
  const { mutate, error, isPending } = useStellarMutation<WithdrawMutation, WithdrawMutationContext>({
    mutationKey: [{ ...rootKeys.userPool(params), name: 'withdraw' }],
    buildContext: (_, baseContext) => ({ ...baseContext, ...params, quote, tokens }) as WithdrawMutationContext,
    createTransaction: (values, context) => fetchWithdrawSimulation({ ...values, ...context }, { staleTime: 0 }),
    validationParams: { ...params, quote },
    validationSuite: withdrawValidationSuite,
    pendingMessage: () => t`Preparing withdrawal`,
    successMessage: () => t`Withdrawal confirmed`,
    onReset,
    onSuccess: async (_, values, context) => {
      const submitted = { ...values, ...context }
      await Promise.allSettled([
        invalidatePoolLiquidity(submitted),
        invalidateExpectedLp({ ...submitted, isDeposit: false }),
        invalidateWithdrawSimulation(submitted),
      ])
    },
  })
  const onSubmit = useCallback(
    (values: WithdrawFormValues) =>
      mutate({
        ...values,
        amounts: getPoolAmounts(values, values.decimals?.length),
        maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
      } as WithdrawMutation),
    [mutate],
  )
  return { onSubmit, mutate, error, isPending }
}
