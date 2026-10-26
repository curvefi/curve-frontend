import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { Form } from '@ui/features/forms/components/Form'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { PoolFormProps } from '@ui/features/pool-forms/pool-form.types'
import { PoolTokenSelector } from '@ui/features/pool-forms/PoolTokenSelector'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { OneCoinWithdrawFormValues } from './withdraw-form.utils'

type Props = PoolFormProps<OneCoinWithdrawFormValues> & {
  index: number
  max: QueryProp<Decimal> | undefined
  inputDisabled: boolean
  onCoinChange: (index: number) => void
  onAmountChange: (amount: Decimal | undefined) => void
  onMax: () => void
}

export const OneCoinWithdrawForm = (props: Props) => {
  const { form, tokens, index, max, onCoinChange, onAmountChange, onMax, isPending, inputDisabled } = props
  const error =
    (form.isTouched('amount') ? (form.formState.errors.amount ?? form.formState.errors.maxAmount) : undefined) ??
    tokens?.[index]?.error
  return (
    <Form {...form} onSubmit={props.onSubmit} footer={props.footer}>
      <LargeTokenInput
        name="amount"
        label={t`Amount to withdraw`}
        testId={`pool-token-input-${tokens?.[index]?.data?.address}`}
        balance={q({ data: form.values.amount, error: error ?? null, isLoading: false })}
        inputBalanceUsd={maybes([form.values.amount, tokens?.[index]?.data?.usdRate], decimalMultiply)}
        onBalance={onAmountChange}
        disabled={inputDisabled}
        maxBalance={max && { balance: max, chips: 'max', onMax }}
        message={error?.message}
        tokenSelector={
          <PoolTokenSelector
            tokens={tokens}
            selectedIndex={index}
            onToken={onCoinChange}
            disabled={isPending}
            label={t`Withdrawal token`}
            testId="withdraw-token-select"
          />
        }
      />
      <FormButton
        {...props.wallet}
        pending={isPending}
        loading={props.isLoading}
        disabled={props.isDisabled}
        label={t`Withdraw`}
        testId="pool-withdraw-submit"
        connectWalletTestId="pool-withdraw-connect-wallet"
      />
      <FormAlerts
        error={props.error}
        formErrors={props.formErrors}
        handledErrors={['amount', 'maxAmount']}
        userAddress={props.userAddress}
      />
    </Form>
  )
}
