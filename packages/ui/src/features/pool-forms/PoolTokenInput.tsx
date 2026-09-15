import { useCallback } from 'react'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { poolAmountField, type PoolTokensForm, poolMaxAmountField } from './pool-form.utils'

export type PoolToken = { address: Address; symbol: string | undefined; balance: QueryProp<Decimal> }

export const PoolTokenInput = ({
  token,
  index,
  disabled,
  label,
}: {
  token: PoolToken
  index: number
  disabled: boolean
  label: string
}) => {
  const {
    update,
    watchValue,
    formState: { errors, touchedFields },
  } = useFormContext<PoolTokensForm>()
  const field = poolAmountField(index)
  useFormSync({ update }, { [poolMaxAmountField(index)]: token.balance.data })
  const amount = watchValue(field)
  const fieldError = touchedFields[field] ? (errors[field] ?? errors[poolMaxAmountField(index)]) : undefined
  const inputError = fieldError ?? token.balance.error
  return (
    <LargeTokenInput
      name={field}
      label={label}
      tokenSelector={<Typography>{token.symbol}</Typography>}
      balance={q({ data: amount, error: inputError ?? null, isLoading: false })}
      onBalance={useCallback((value: Decimal | undefined) => update({ [field]: value }), [update, field])}
      disabled={disabled}
      walletBalance={{ symbol: token.symbol, balance: token.balance }}
      maxBalance={{ balance: token.balance, chips: 'max' }}
      message={inputError?.message}
      testId={`pool-token-input-${token.address}`}
    />
  )
}
