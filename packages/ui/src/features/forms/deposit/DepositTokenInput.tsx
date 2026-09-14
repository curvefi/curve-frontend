import { useCallback } from 'react'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { depositAmountField, depositMaxAmountField, type DepositFormValues } from './deposit-form.utils'

export type DepositToken = { address: Address; symbol: string | undefined; balance: QueryProp<Decimal> }

type DepositTokenInputProps = { token: DepositToken; index: number; disabled: boolean }

export const DepositTokenInput = ({ token, index, disabled }: DepositTokenInputProps) => {
  const {
    update,
    watchValue,
    formState: { errors, touchedFields },
  } = useFormContext<DepositFormValues>()
  const field = depositAmountField(index)
  useFormSync({ update }, { [depositMaxAmountField(index)]: token.balance.data })
  const amount = watchValue(field)
  const fieldError = touchedFields[field] ? (errors[field] ?? errors[depositMaxAmountField(index)]) : undefined
  const inputError = fieldError ?? token.balance.error
  return (
    <LargeTokenInput
      name={field}
      label={t`Amount to deposit`}
      tokenSelector={<Typography>{token.symbol}</Typography>}
      balance={q({ data: amount, error: inputError ?? null, isLoading: false })}
      onBalance={useCallback((value: Decimal | undefined) => update({ [field]: value }), [update, field])}
      disabled={disabled}
      walletBalance={{ symbol: token.symbol, balance: token.balance }}
      maxBalance={{ balance: token.balance, chips: 'max' }}
      message={inputError?.message}
      testId={`pool-deposit-input-${token.address}`}
    />
  )
}
