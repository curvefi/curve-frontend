import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { Form } from '@ui/features/forms/components/Form'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { PoolFormProps } from '@ui/features/pool-forms/pool-form.types'
import { PoolTokenSelector } from '@ui/features/pool-forms/PoolTokenSelector'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { OneCoinWithdrawFormValues } from './withdraw-form.utils'

export const OneCoinWithdrawForm = ({
  form,
  tokens,
  index,
  max,
  onCoinChange,
  onAmountChange,
  onSubmit,
  footer,
  wallet,
  isPending,
  isLoading,
  isDisabled,
  inputDisabled,
  error,
  formErrors,
  userAddress,
}: PoolFormProps<OneCoinWithdrawFormValues> & {
  index: number
  max: QueryProp<Decimal> | undefined
  inputDisabled: boolean
  onCoinChange: (index: number) => void
  onAmountChange: (amount: Decimal | undefined) => void
}) => {
  const token = tokens?.[index]
  return (
    <Form {...form} onSubmit={onSubmit} footer={footer}>
      <FormTokenInput
        form={form}
        name="amount"
        max={max}
        maxField="poolReserve"
        error={token?.error}
        label={t`Amount to withdraw`}
        testId={`pool-token-input-${token?.data?.address}`}
        inputBalanceUsd={maybes([form.values.amount, token?.data?.usdRate], decimalMultiply)}
        onBalance={onAmountChange}
        disabled={inputDisabled}
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
        handledErrors={['amount', 'poolReserve']}
        userAddress={userAddress}
      />
    </Form>
  )
}
