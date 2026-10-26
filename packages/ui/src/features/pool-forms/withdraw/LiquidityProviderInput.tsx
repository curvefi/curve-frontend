import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import type { AdvancedWithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export function LiquidityProviderInput({
  form,
  balance,
  inputBalanceUsd,
  isDisabled,
  onChange,
}: {
  form: UseFormReturn<AdvancedWithdrawFormValues>
  inputBalanceUsd?: Decimal
  balance: QueryProp<Decimal>
  isDisabled: boolean
  onChange: (amount: Decimal | undefined) => void
}) {
  const { formState, values } = form
  const { errors, touchedFields } = formState
  const error = (touchedFields.lpAmount ? (errors.lpAmount ?? errors.maxLpAmount) : undefined) ?? balance.error
  return (
    <LargeTokenInput
      name="lpAmount"
      label={t`LP amount`}
      balance={q({ data: values.lpAmount, error: error ?? null, isLoading: false })}
      inputBalanceUsd={inputBalanceUsd}
      onBalance={onChange}
      walletBalance={{ symbol: t`LP Tokens`, balance }}
      maxBalance={{ balance, chips: 'max', onMax: onChange }}
      disabled={isDisabled}
      message={error?.message}
      testId="pool-withdraw-lp-input"
    />
  )
}
