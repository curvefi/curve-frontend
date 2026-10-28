import type { Decimal } from '@primitives/decimal.utils'
import { Form } from '@ui/features/forms/components/Form'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { PoolFormProps } from '@ui/features/pool-forms/pool-form.types'
import { allTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { PoolTokenInputs } from '@ui/features/pool-forms/PoolTokenInputs'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { AdvancedWithdrawFormValues } from './withdraw-form.utils'

export const AdvancedWithdrawForm = ({
  form,
  tokens,
  onSubmit,
  footer,
  wallet,
  isPending,
  isLoading,
  isDisabled,
  error,
  formErrors,
  userAddress,
  lpAmountUsd,
  lpBalance,
  canBalance,
  onBalancedChange,
  onLpChange,
  onTokenChange,
}: PoolFormProps<AdvancedWithdrawFormValues> & {
  lpAmountUsd?: Decimal
  lpBalance: QueryProp<Decimal>
  canBalance: boolean | undefined
  onBalancedChange: (balanced: boolean) => void
  onLpChange: (amount: Decimal | undefined) => void
  onTokenChange: (index: number, amount: Decimal | undefined) => void
}) => (
  <Form {...form} onSubmit={onSubmit} footer={footer}>
    {form.values.isBalanced && (
      <FormTokenInput
        form={form}
        name="lpAmount"
        max={{ balance: lpBalance, field: 'maxLpAmount' }}
        label={t`LP amount`}
        inputBalanceUsd={lpAmountUsd}
        onBalance={onLpChange}
        walletBalance={{ symbol: t`LP Tokens`, balance: lpBalance }}
        disabled={isPending || !canBalance}
        testId="pool-withdraw-lp-input"
      />
    )}
    <PoolTokenInputs
      form={form}
      tokens={tokens}
      disabled={isPending || (form.values.isBalanced && !canBalance)}
      showBalance={false}
      onValueChange={onTokenChange}
    />
    <CheckboxField
      label={t`Withdraw custom balances`}
      checked={!form.values.isBalanced}
      onChange={event => onBalancedChange(!event.target.checked)}
      disabled={isPending || !canBalance}
      testIdPrefix="withdraw-unbalanced"
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
      handledErrors={[
        ...(form.values.isBalanced ? ['lpAmount' as const, 'maxLpAmount' as const] : []),
        ...(allTokenFields(tokens?.length) ?? []),
      ]}
      userAddress={userAddress}
    />
  </Form>
)
