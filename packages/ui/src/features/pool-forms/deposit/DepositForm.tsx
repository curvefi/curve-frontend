import type { ReactNode } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybe, type Nullish } from '@primitives/objects.utils'
import { type ErrorKey, type FormUpdates, useFormSync } from '@ui/features/forms'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import { allTokenFields, poolMaxAmountField, type PoolDepositForm, type PoolTokenField } from '../pool-form.utils'
import type { PoolTokenDisabled } from '../PoolTokenInputs'
import { WrappedDepositCheckbox } from './WrappedDepositCheckbox'

export type DepositFormProps<TValues extends PoolDepositForm = PoolDepositForm> = PoolFormProps<TValues> & {
  // Add a shared-field update signature because TypeScript cannot resolve these fields through generic TValues.
  form: { update: (updates: FormUpdates<PoolDepositForm>) => void }
  reserves: QueryProp<Decimal[]>
  isSeed: QueryProp<boolean>
  canDepositWrapped?: boolean | Nullish
  inputsDisabled: PoolTokenDisabled
  maxAmounts: QueryProp<Decimal>[] | undefined
}

export const DepositForm = <TValues extends PoolDepositForm>({
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
  canDepositWrapped,
  inputsDisabled,
  maxAmounts,
  children,
}: DepositFormProps<TValues> & { children: ReactNode }) => {
  useFormSync<PoolDepositForm>(form, {
    ...maybe(maxAmounts, amounts => fromEntries(amounts.map((max, index) => [poolMaxAmountField(index), max.data]))),
  })
  return (
    <Form {...form} onSubmit={onSubmit} footer={footer}>
      {children}
      {canDepositWrapped && <WrappedDepositCheckbox disabled={isPending || inputsDisabled !== false} />}
      <FormButton
        {...wallet}
        pending={isPending}
        loading={isLoading}
        disabled={isDisabled}
        label={t`Deposit`}
        testId="pool-deposit-submit"
        connectWalletTestId="pool-deposit-connect-wallet"
      />
      <FormAlerts<ErrorKey<TValues> | PoolTokenField>
        error={error}
        formErrors={formErrors}
        handledErrors={allTokenFields(tokens?.length) ?? []}
        userAddress={userAddress}
      />
    </Form>
  )
}
