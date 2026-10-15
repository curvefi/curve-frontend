import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { isComplete } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, notFalsyArray, type Nullish } from '@primitives/objects.utils'
import { type ErrorKey, type FormUpdates } from '@ui/features/forms'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { getBalancedAmounts } from '../balanced-amounts.utils'
import type { PoolFormProps } from '../pool-form.types'
import { allTokenFields, poolAmountField, type PoolDepositForm, type PoolTokenField } from '../pool-form.utils'
import { type PoolTokenDisabled, PoolTokenInputs } from '../PoolTokenInputs'
import { BalancedDepositCheckbox } from './BalancedDepositCheckbox'
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
  reserves,
  isPending,
  isLoading,
  isDisabled,
  wallet,
  userAddress,
  error,
  formErrors,
  footer,
  isSeed,
  canDepositWrapped,
  inputsDisabled,
  maxAmounts,
}: DepositFormProps<TValues>) => (
  <Form {...form} onSubmit={onSubmit} footer={footer}>
    {isSeed.data && (
      <Alert severity="info" variant="outlined" data-testid="pool-deposit-seed-alert">
        <AlertTitle>{t`The first deposit must fund every coin`}</AlertTitle>
        {t`The seed lock is permanent; expected LP is the net amount you receive.`}
      </Alert>
    )}
    <PoolTokenInputs
      tokens={tokens}
      disabled={inputsDisabled}
      maxAmounts={maxAmounts}
      onValueChange={(index, value) => {
        const { isBalanced, decimals } = form.getValues()
        form.update(
          isBalanced && isComplete(reserves.data) && isComplete(decimals)
            ? fromEntries(
                getBalancedAmounts(reserves.data, decimals, value, index).map((amount, i) => [
                  poolAmountField(i),
                  amount,
                ]),
              )
            : { [poolAmountField(index)]: value },
        )
      }}
    />
    {canDepositWrapped && <WrappedDepositCheckbox disabled={isPending || inputsDisabled !== false} />}
    <BalancedDepositCheckbox
      reserves={reserves}
      isConnected={wallet.isConnected}
      disabled={
        isPending ||
        isSeed.data !== false ||
        notFalsyArray<QueryProp<unknown>>(tokens, [reserves], maxAmounts).some(q => q.isLoading)
      }
    />
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
