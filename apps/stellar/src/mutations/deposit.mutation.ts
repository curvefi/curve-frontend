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
  depositQuoteValidationSuite,
  depositSubmissionValidationSuite,
  type DepositSubmission,
  type DepositFormValues,
} from '@/stellar/queries/validation/deposit.validation'
import { zip } from '@primitives/array.utils'
import { fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { assertValidity } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { useStellarTransactionMutation } from './useStellarTransactionMutation'

export const useDepositMutation = ({
  onReset,
  ...params
}: Omit<FieldsOf<DepositSubmission>, 'amounts'> & { onReset: (submitted: DepositSubmission) => void }) => {
  const { mutate, error, isPending, hash } = useStellarTransactionMutation<DepositSubmission>({
    mutationKey: [...rootKeys.userPool(params), 'deposit'],
    createTransaction: params => fetchDepositSimulation(params, { staleTime: 0 }),
    validateTransaction: async (transaction, params) => {
      const simulatedLpAmount = fromWei(transaction.result.toString(), LP_TOKEN_DECIMALS)
      // The submitted quote is the accepted preview. Refresh it on mismatch so the user can review the new minimum.
      if (simulatedLpAmount !== params.quote) await invalidateExpectedLp(params)
      assertValidity(depositQuoteValidationSuite, { quote: simulatedLpAmount, acceptedQuote: params.quote })
    },
    validationSuite: depositSubmissionValidationSuite,
    pendingMessage: t`Preparing deposit`,
    successMessage: t`Deposit confirmed`,
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
    ({ amounts }: DepositFormValues) =>
      mutate({ network, pool, account, decimals, tokens, quote, minMint, slippage, maxAmounts, supply, amounts }),
    [mutate, network, pool, account, decimals, tokens, quote, minMint, slippage, maxAmounts, supply],
  )
  return { onSubmit, mutate, error, isPending, hash }
}
