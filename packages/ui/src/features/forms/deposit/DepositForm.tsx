import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { type ErrorKey, type UseFormReturn, type FormSubmitHandler, type VisibleErrors } from '@ui/features/forms'
import { Form } from '@ui/features/forms/components/Form'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import { FormAlerts, HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { FormButton, type FormButtonProps } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import {
  depositAmountField,
  depositMaxAmountField,
  type DepositField,
  type DepositFormValues,
} from './deposit-form.utils'
import { DepositTokenInput, type DepositToken } from './DepositTokenInput'

export type { DepositFormValues } from './deposit-form.utils'
export type DepositFormProps<TValues extends DepositFormValues = DepositFormValues> = {
  form: UseFormReturn<TValues>
  tokens: QueryProp<DepositToken[]>
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
  isSeed: boolean
}

export const DepositForm = <TValues extends DepositFormValues>({
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
    {isSeed && (
      <Alert severity="info" variant="outlined" data-testid="pool-deposit-seed-alert">
        <AlertTitle>{t`The first deposit must fund every coin`}</AlertTitle>
        {t`The seed lock is permanent; expected LP is the net amount you receive.`}
      </Alert>
    )}
    {tokens?.map((token, index) => (
      <DepositTokenInput key={token.address} token={token} index={index} disabled={isPending} />
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
    <FormAlerts<ErrorKey<TValues> | DepositField>
      error={error}
      formErrors={formErrors}
      handledErrors={tokens?.flatMap((_, index) => [depositAmountField(index), depositMaxAmountField(index)]) ?? []}
      userAddress={userAddress}
    />
  </Form>
)
