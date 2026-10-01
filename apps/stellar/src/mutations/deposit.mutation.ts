import { useCallback } from 'react'
import type {
  DepositForm,
  DepositMutation,
  DepositMutationContext,
  DepositMutationOptions,
} from '@/stellar/features/deposit/types'
import { fetchDepositSimulation, invalidateDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import { invalidateExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { rootKeys } from '@/stellar/queries/root-keys'
import { depositMutationValidationSuite } from '@/stellar/queries/validation/deposit.validation'
import { getPoolAmounts, getPoolMaxAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { t } from '@ui/lib/i18n'
import { invalidatePoolLiquidity } from './invalidatePoolLiquidity'
import { useStellarMutation } from './useStellarMutation'

export const useDepositMutation = ({
  network,
  pool,
  account,
  tokens,
  quote,
  minMint,
  onReset,
}: DepositMutationOptions) => {
  const { mutate, error, isPending } = useStellarMutation<DepositMutation, DepositMutationContext>({
    mutationKey: [{ ...rootKeys.userPool({ network, pool, account }), name: 'deposit' }],
    buildContext: (_, baseContext) =>
      ({ ...baseContext, network, pool, tokens, quote, minMint }) as DepositMutationContext,
    createTransaction: (values, context) => fetchDepositSimulation({ ...values, ...context }, { staleTime: 0 }),
    validationSuite: depositMutationValidationSuite,
    validationParams: { network, pool, account, tokens, quote, minMint },
    pendingMessage: () => t`Preparing deposit`,
    successMessage: () => t`Deposit confirmed`,
    onReset,
    onSuccess: async (_, values, context) => {
      const submitted = { ...values, ...context }
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
        amounts: getPoolAmounts(values, values.decimals?.length),
        maxAmounts: getPoolMaxAmounts(values, values.decimals?.length),
      } as DepositMutation),
    [mutate],
  )
  return { onSubmit, mutate, error, isPending }
}
