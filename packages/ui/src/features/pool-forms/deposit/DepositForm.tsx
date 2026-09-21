import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { Decimal } from '@primitives/decimal.utils'
import { type ErrorKey } from '@ui/features/forms'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { FormButton } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolFormProps } from '../pool-form.types'
import { allTokenFields, type PoolForm, type PoolTokenField } from '../pool-form.utils'
import { PoolTokenInputs } from '../PoolTokenInputs'
import { BalancedDepositCheckbox } from './BalancedDepositCheckbox'
export type { PoolTokenFields } from '../pool-form.utils'

export type DepositFormProps<TValues extends PoolForm = PoolForm> = PoolFormProps<TValues> & {
  reserves: QueryProp<Decimal[]>
  isSeed: QueryProp<boolean>
}

export const DepositForm = <TValues extends PoolForm>({
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
}: DepositFormProps<TValues>) => (
  <Form {...form} onSubmit={onSubmit} footer={footer}>
    {isSeed.data && (
      <Alert severity="info" variant="outlined" data-testid="pool-deposit-seed-alert">
        <AlertTitle>{t`The first deposit must fund every coin`}</AlertTitle>
        {t`The seed lock is permanent; expected LP is the net amount you receive.`}
      </Alert>
    )}
    <PoolTokenInputs tokens={tokens} reserves={reserves} isDisabled={isPending} />
    <BalancedDepositCheckbox
      reserves={reserves}
      isConnected={wallet.isConnected}
      disabled={isPending || isSeed.data !== false}
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
      handledErrors={allTokenFields(tokens.data?.length) ?? []}
      userAddress={userAddress}
    />
  </Form>
)
