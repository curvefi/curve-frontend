import type { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { type UseFormReturn, type FormSubmitHandler, type VisibleErrors } from '@ui/features/forms'
import { Form } from '@ui/features/forms/components/Form'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import { FormAlerts, HighPriceImpactAlert } from '@ui/features/forms/FormAlerts'
import { FormButton, type FormButtonProps } from '@ui/features/forms/FormButton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export type DepositFormValues = { amounts: (Decimal | undefined)[] | undefined }
export type DepositFormProps<TValues extends DepositFormValues = DepositFormValues> = {
  form: UseFormReturn<TValues>
  amounts: (Decimal | undefined)[] | undefined
  tokens: QueryProp<{ address: Address; symbol: string | undefined; balance: QueryProp<Decimal>; error?: string }[]>
  onAmount: (index: number, amount: Decimal | undefined) => void
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
  amounts,
  tokens,
  onAmount,
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
      <Alert severity="info">{t`The first deposit must fund every coin. The seed lock is permanent; expected LP is the net amount you receive.`}</Alert>
    )}
    {tokens.isLoading && !tokens.data && (
      <>
        <LargeTokenInputSkeleton />
        <LargeTokenInputSkeleton />
      </>
    )}
    {tokens.data?.map((token, index) => (
      <LargeTokenInput
        key={token.address}
        name={`amounts.${index}`}
        label={t`Amount to deposit`}
        tokenSelector={<Typography>{token.symbol}</Typography>}
        balance={amounts?.[index]}
        onBalance={amount => onAmount(index, amount)}
        disabled={isPending}
        walletBalance={{ symbol: token.symbol, balance: token.balance }}
        maxBalance={{ balance: token.balance, chips: 'max' }}
        message={token.error}
        testId={`pool-deposit-input-${index}`}
      />
    ))}
    <HighPriceImpactAlert priceImpact={priceImpact} />
    <FormButton
      {...wallet}
      pending={isPending}
      loading={isLoading}
      disabled={isDisabled}
      label={t`Deposit`}
      testId="pool-deposit-submit"
    />
    <FormAlerts error={error} formErrors={formErrors} handledErrors={[]} userAddress={userAddress} />
  </Form>
)
