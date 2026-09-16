import { useCallback } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { poolAmountField, type PoolTokensForm, poolMaxAmountField } from './pool-form.utils'

export type PoolToken = {
  blockchainId: string
  address: Address
  symbol: string | undefined
  balance: QueryProp<Decimal>
}

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
      tokenSelector={
        <TokenLabel
          blockchainId={token.blockchainId}
          address={token.address}
          label={token.symbol}
          size="mui-md"
          disabled={disabled}
          noWrap
        />
      }
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
