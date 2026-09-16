import type { Decimal } from '@primitives/decimal.utils'
import { Form } from '@ui/features/forms/components/Form'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { FormAlerts, HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import { q, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import { poolTokenFields } from '../pool-form.utils'
import { PoolTokenInputs } from '../PoolTokenInputs'
import type { WithdrawFormValues } from './withdraw-form.utils'

type WithdrawFormProps = PoolFormProps<WithdrawFormValues> & {
  reserves: QueryProp<Decimal[]>
  maxAmounts: QueryProp<(Decimal | undefined)[]>
  lpBalance: QueryProp<Decimal>
  onLpAmount: (value: Decimal | undefined) => void
  isLpDisabled: boolean
}

export const WithdrawForm = ({
  form,
  tokens,
  onSubmit,
  isPending,
  isLoading,
  isDisabled,
  wallet,
  userAddress,
  error,
  formErrors,
  footer,
  priceImpact,
  reserves,
  maxAmounts,
  lpBalance,
  onLpAmount,
  isLpDisabled,
}: WithdrawFormProps) => {
  const { errors, touchedFields } = form.formState
  const lpError = (touchedFields.lpAmount ? (errors.lpAmount ?? errors.maxLpAmount) : undefined) ?? lpBalance.error
  return (
    <Form {...form} onSubmit={onSubmit} footer={footer}>
      <LargeTokenInput
        name="lpAmount"
        label={t`LP amount`}
        balance={q({ data: form.watchValue('lpAmount'), error: lpError ?? null, isLoading: false })}
        onBalance={onLpAmount}
        walletBalance={{ symbol: t`LP Tokens`, balance: lpBalance }}
        maxBalance={{ balance: lpBalance, chips: 'max', onMax: onLpAmount }}
        disabled={isLpDisabled}
        message={
          lpError?.message ?? t`Entering an LP amount fills balanced outputs. You can then edit the token amounts.`
        }
        testId="pool-withdraw-lp-input"
      />
      <PoolTokenInputs tokens={tokens} reserves={reserves} disabled={isPending} maxAmounts={maxAmounts} hideMaxButton />
      <HighPriceImpactAlert priceImpact={priceImpact} />
      <FormButton
        {...wallet}
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={t`Withdraw`}
        testId="pool-withdraw-submit"
        connectWalletTestId="pool-withdraw-connect-wallet"
      />
      <FormAlerts
        error={error}
        formErrors={formErrors}
        handledErrors={[
          'lpAmount',
          'maxLpAmount',
          ...(tokens.data?.flatMap((_, index) => poolTokenFields(index)) ?? []),
        ]}
        userAddress={userAddress}
      />
    </Form>
  )
}
