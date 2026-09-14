import { useCallback } from 'react'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { invalidateExpectedLp } from '@/stellar/queries/deposit/deposit-expected-lp.query'
import { fetchDepositSimulation, invalidateDepositSimulation } from '@/stellar/queries/deposit/deposit-simulation.query'
import { invalidatePoolRates } from '@/stellar/queries/pool/pool-rates.query'
import { invalidatePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { invalidatePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { rootKeys } from '@/stellar/queries/root-keys'
import { invalidateTokenBalance } from '@/stellar/queries/token/token-balance.query'
import {
  depositMutationValidationSuite,
  type DepositMutation,
  type DepositForm,
} from '@/stellar/queries/validation/deposit.validation'
import { zip } from '@primitives/array.utils'
import { getDepositAmounts } from '@ui/features/forms/deposit/deposit-form.utils'
import type { DeepPartial } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { FieldsOf } from '@ui/lib/validation/types'
import { useStellarMutation } from './useStellarMutation'

type DepositOptions = FieldsOf<DeepPartial<DepositMutation>> & { onReset: () => void }

export const useDepositMutation = ({ onReset, ...params }: DepositOptions) => {
  const { mutate, error, isPending } = useStellarMutation<DepositMutation>({
    mutationKey: [...rootKeys.userPool(params), 'deposit'],
    createTransaction: params => fetchDepositSimulation(params, { staleTime: 0 }),
    validationSuite: depositMutationValidationSuite,
    pendingMessage: () => t`Preparing deposit`,
    confirmingMessage: () => t`Confirm in your wallet and wait for transaction confirmation`,
    successMessage: () => t`Deposit confirmed`,
    onReset,
    onSuccess: async (_, submitted) => {
      await Promise.allSettled([
        ...zip(submitted.tokens, submitted.decimals).map(([token, decimals]) =>
          invalidateTokenBalance({ ...submitted, token, decimals }),
        ),
        invalidateTokenBalance({ ...submitted, token: submitted.pool, decimals: LP_TOKEN_DECIMALS }),
        invalidatePoolReserves(submitted),
        invalidatePoolSupply(submitted),
        invalidatePoolRates(submitted),
        invalidateExpectedLp(submitted),
        invalidateDepositSimulation(submitted),
      ])
    },
  })
  const { network, pool, account, decimals, tokens, quote, minMint, slippage, maxAmounts, supply } = params
  const onSubmit = useCallback(
    (values: DepositForm) =>
      mutate({
        network,
        pool,
        account,
        decimals,
        tokens,
        quote,
        minMint,
        slippage,
        maxAmounts,
        supply,
        amounts: getDepositAmounts(values, tokens?.length),
      } as DepositMutation),
    [mutate, network, pool, account, decimals, tokens, quote, minMint, slippage, maxAmounts, supply],
  )
  return { onSubmit, mutate, error, isPending }
}
