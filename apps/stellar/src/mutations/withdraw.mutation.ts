import { useCallback } from 'react'
import type { WithdrawMutation, WithdrawMutationOptions } from '@/stellar/features/withdraw/types'
import { invalidateExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { rootKeys } from '@/stellar/queries/root-keys'
import { withdrawValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import {
  fetchWithdrawSimulation,
  invalidateWithdrawSimulation,
} from '@/stellar/queries/withdraw/withdraw-simulation.query'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { t } from '@ui/lib/i18n'
import { invalidatePoolLiquidity } from './invalidatePoolLiquidity'
import { useStellarMutation } from './useStellarMutation'

export const useWithdrawMutation = ({ onReset, tokens, ...params }: WithdrawMutationOptions) => {
  const { mutate, error, isPending } = useStellarMutation<WithdrawMutation>({
    mutationKey: [...rootKeys.userPool(params), 'withdraw'],
    createTransaction: (values, { account }) =>
      fetchWithdrawSimulation({ ...values, ...params, account }, { staleTime: 0 }),
    validationParams: params,
    validationSuite: withdrawValidationSuite,
    pendingMessage: () => t`Preparing withdrawal`,
    successMessage: () => t`Withdrawal confirmed`,
    onReset,
    onSuccess: async (_, values, { account }) => {
      const submitted = { ...values, ...params, account }
      await Promise.allSettled([
        invalidatePoolLiquidity({ ...submitted, tokens }),
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
