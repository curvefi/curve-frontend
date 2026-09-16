import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { type UseFormReturn, type FormSubmitHandler, type VisibleErrors, type ErrorKey } from '@ui/features/forms'
import { Form } from '@ui/features/forms/components/Form'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import { FormAlerts, HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { FormButton, type FormButtonProps } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { type PoolTokensForm, type PoolTokenField, poolTokenFields } from '../pool-form.utils'
import { PoolTokenInput, type PoolToken } from '../PoolTokenInput'
export type { PoolTokensForm } from '../pool-form.utils'

export type DepositFormProps<TValues extends PoolTokensForm = PoolTokensForm> = {
  form: UseFormReturn<TValues>
  tokens: QueryProp<PoolToken[]>
  onSubmit: FormSubmitHandler
  isPending: boolean
  isLoading: boolean
  isDisabled: boolean
  wallet: Pick<FormButtonProps, 'connect' | 'isConnected' | 'isConnecting'>
  userAddress: Address | undefined
  error: Error | null | undefined
  formErrors: VisibleErrors<TValues>
  footer: ReactNode
  priceImpact: QueryProp<Decimal | null>
  isSeed: QueryProp<boolean>
}

export const DepositForm = <TValues extends PoolTokensForm>({
  form,
  tokens: { data: tokens, error: tokensError },
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
  isSeed,
}: DepositFormProps<TValues>) => (
  <Form {...form} onSubmit={onSubmit} footer={footer}>
    {isSeed.data && (
      <Alert severity="info" variant="outlined" data-testid="pool-deposit-seed-alert">
        <AlertTitle>{t`The first deposit must fund every coin`}</AlertTitle>
        {t`The seed lock is permanent; expected LP is the net amount you receive.`}
      </Alert>
    )}
    {tokens?.map((token, index) => (
      <PoolTokenInput
        label={t`Amount to deposit`}
        key={token.address}
        token={token}
        index={index}
        disabled={isPending}
      />
    )) ??
      (!tokensError && (
        <>
          <LargeTokenInputSkeleton />
          <LargeTokenInputSkeleton />
        </>
      ))}
    <HighPriceImpactAlert priceImpact={priceImpact} />
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
      handledErrors={tokens?.flatMap((_, index) => poolTokenFields(index)) ?? []}
      userAddress={userAddress}
    />
  </Form>
)
