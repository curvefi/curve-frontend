import { useCallback } from 'react'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { getBalancedAmounts } from './balanced-amounts.utils'
import { poolAmountField, type PoolForm, poolMaxAmountField } from './pool-form.utils'

export type PoolToken = { address: Address; symbol: string | undefined; balance: QueryProp<Decimal> }

export const PoolTokenInput = ({
  token: { address, balance, symbol },
  index,
  disabled,
  reserves: { data: reserves },
}: {
  token: PoolToken
  index: number
  disabled: boolean
  reserves: QueryProp<Decimal[]>
}) => {
  const {
    update,
    watchValue,
    getValue,
    formState: { errors, touchedFields },
  } = useFormContext<PoolForm>()
  const field = poolAmountField(index)
  useFormSync({ update }, { [poolMaxAmountField(index)]: balance.data })
  const amount = watchValue(field)
  const fieldError = touchedFields[field] ? (errors[field] ?? errors[poolMaxAmountField(index)]) : undefined
  const inputError = fieldError ?? balance.error
  return (
    <LargeTokenInput
      name={field}
      tokenSelector={<Typography>{symbol}</Typography>}
      balance={q({ data: amount, error: inputError ?? null, isLoading: false })}
      onBalance={useCallback(
        (value: Decimal | undefined) => {
          const decimals = getValue('decimals')
          update(
            getValue('isBalanced') && reserves?.every(reserve => +reserve) && decimals?.every(value => value != null)
              ? fromEntries(
                  getBalancedAmounts(reserves, decimals, value, index).map((amount, index) => [
                    poolAmountField(index),
                    amount,
                  ]),
                )
              : { [field]: value },
          )
        },
        [getValue, update, reserves, index, field],
      )}
      disabled={disabled}
      walletBalance={{ symbol, balance }}
      maxBalance={{ balance, chips: 'max' }}
      message={inputError?.message}
      testId={`pool-token-input-${address}`}
    />
  )
}
