import type { Decimal } from '@primitives/decimal.utils'
import { Form } from '@ui/features/forms/components/Form'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { PoolFormProps } from '@ui/features/pool-forms/pool-form.types'
import { allTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import { PoolTokenInputs } from '@ui/features/pool-forms/PoolTokenInputs'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { LiquidityProviderInput } from './LiquidityProviderInput'
import type { AdvancedWithdrawFormValues } from './withdraw-form.utils'

type Props = PoolFormProps<AdvancedWithdrawFormValues> & {
  lpAmountUsd?: Decimal
  lpBalance: QueryProp<Decimal>
  supportsBalanced: boolean
  canBalance: boolean | undefined
  onBalancedChange: (balanced: boolean) => void
  onLpChange: (amount: Decimal | undefined) => void
  onTokenChange: (index: number, amount: Decimal | undefined) => void
}

export const AdvancedWithdrawForm = (props: Props) => {
  const {
    form,
    tokens,
    isPending,
    lpBalance,
    supportsBalanced,
    canBalance,
    onBalancedChange,
    onLpChange,
    onTokenChange,
  } = props
  return (
    <Form {...form} onSubmit={props.onSubmit} footer={props.footer}>
      {form.values.isBalanced && (
        <LiquidityProviderInput
          form={form}
          balance={lpBalance}
          inputBalanceUsd={props.lpAmountUsd}
          isDisabled={isPending || !canBalance}
          onChange={onLpChange}
        />
      )}
      <PoolTokenInputs
        tokens={tokens}
        disabled={isPending || (form.values.isBalanced && !canBalance)}
        showBalance={false}
        onValueChange={onTokenChange}
      />
      <CheckboxField
        label={t`Withdraw unbalanced`}
        checked={!form.values.isBalanced}
        onChange={event => onBalancedChange(!event.target.checked)}
        disabled={isPending || !supportsBalanced || !canBalance}
        testIdPrefix="withdraw-unbalanced"
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
        handledErrors={[
          ...(form.values.isBalanced ? ['lpAmount' as const, 'maxLpAmount' as const] : []),
          ...(allTokenFields(tokens?.length) ?? []),
        ]}
        userAddress={props.userAddress}
      />
    </Form>
  )
}
