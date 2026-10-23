import { useCallback } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import { allTokenFields, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { LiquidityProviderInput } from '@ui/features/pool-forms/withdraw/LiquidityProviderInput'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalEqual } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import { PoolTokenInputs } from '../PoolTokenInputs'
import type { WithdrawFormValues } from './withdraw-form.utils'
import { WrappedWithdrawCheckbox } from './WrappedWithdrawCheckbox'

type WithdrawFormProps = PoolFormProps<WithdrawFormValues> & {
  reserves: QueryProp<Decimal[]>
  maxAmounts: QueryProp<Decimal>[] | undefined
  decimals: QueryProp<number>[] | undefined
  lpBalance: QueryProp<Decimal>
  supply: QueryProp<Decimal>
  canWithdrawWrapped: boolean
  lpTokenDecimals: number
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
  reserves,
  maxAmounts,
  lpBalance,
  decimals,
  lpTokenDecimals,
  supply,
  canWithdrawWrapped,
}: WithdrawFormProps) => {
  const { update } = form
  const onMax = useCallback(
    (index: number) =>
      update({
        // Withdraw the full LP balance into the selected coin, clearing the other outputs and balanced mode.
        ...(maxAmounts && fromEntries(maxAmounts.map((max, i) => [poolAmountField(i), i === index ? max.data : '0']))),
        lpAmount: lpBalance.data,
        maxWithdrawIndex: index,
        isBalanced: false,
      }),
    [update, maxAmounts, lpBalance.data],
  )

  return (
    <Form {...form} onSubmit={onSubmit} footer={footer}>
      <LiquidityProviderInput
        tokens={tokens}
        reserves={reserves}
        decimals={decimals}
        lpTokenDecimals={lpTokenDecimals}
        supply={supply}
        balance={lpBalance}
        isDisabled={isPending}
      />
      <PoolTokenInputs
        tokens={tokens}
        disabled={isPending}
        positionAmounts={maxAmounts}
        positionTooltip={t`Maximum withdrawal into this token`}
        maxAmounts={maxAmounts}
        maxSelectedIndex={form.values.maxWithdrawIndex}
        onMax={onMax}
        onValueChange={(index, value) => {
          const max = maxAmounts?.[index]?.data
          if (value && +value && max && decimalEqual(value, max)) return onMax(index)
          update({ ...fromEntries([[poolAmountField(index), value]]), isBalanced: false, maxWithdrawIndex: undefined })
        }}
      />
      {canWithdrawWrapped && <WrappedWithdrawCheckbox disabled={isPending} />}
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
        handledErrors={['lpAmount', 'maxLpAmount', ...(allTokenFields(tokens?.length) ?? [])]}
        userAddress={userAddress}
      />
    </Form>
  )
}
