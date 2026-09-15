import { useCallback } from 'react'
import { fetchDepositSimulation, invalidateDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import { invalidateExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { rootKeys } from '@/stellar/queries/root-keys'
import {
  depositMutationValidationSuite,
  type DepositMutation,
  type DepositForm,
} from '@/stellar/queries/validation/deposit.validation'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { t } from '@ui/lib/i18n'
import type { FieldsOf } from '@ui/lib/validation/types'
import { invalidatePoolLiquidity } from './invalidatePoolLiquidity'
import { useStellarMutation } from './useStellarMutation'

type DepositOptions = FieldsOf<
  Pick<DepositMutation, 'network' | 'pool' | 'account' | 'tokens' | 'quote' | 'minMint'>
> & { onReset: () => void }

export const useDepositMutation = ({ onReset, ...params }: DepositOptions) => {
  const { mutate, error, isPending } = useStellarMutation<DepositMutation>({
    mutationKey: [...rootKeys.userPool(params), 'deposit'],
    createTransaction: params => fetchDepositSimulation(params, { staleTime: 0 }),
    validationSuite: depositMutationValidationSuite,
    pendingMessage: () => t`Preparing deposit`,
    successMessage: () => t`Deposit confirmed`,
    onReset,
    onSuccess: async (_, submitted) => {
      await Promise.allSettled([
        invalidatePoolLiquidity(submitted),
        invalidateExpectedLp({ ...submitted, isDeposit: true }),
        invalidateDepositSimulation(submitted),
      ])
    },
  })
  const onSubmit = useCallback(
    (values: DepositForm) =>
      mutate({
        ...values,
        ...params,
        amounts: getPoolAmounts(values, params.tokens?.length),
        maxAmounts: getPoolMaxAmounts(values, params.tokens?.length),
      } as DepositMutation),
    [mutate, params],
  )
  return { onSubmit, mutate, error, isPending }
}
