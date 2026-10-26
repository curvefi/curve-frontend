import { useCallback } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalMultiply } from '@ui/lib/decimal'
import { LargeTokenInput, type LargeTokenInputProps } from '../forms/controls/LargeTokenInput/LargeTokenInput'
import { poolAmountField, type PoolForm, poolMaxAmountField } from './pool-form.utils'

export type PoolToken = {
  blockchainId: string | undefined
  address: Address
  symbol: string | undefined
  balance: QueryProp<Decimal>
  usdRate: number | undefined
}

export const PoolTokenInput = ({
  token: { blockchainId, address, symbol, usdRate },
  index,
  disabled,
  max,
  isMaxSelected = false,
  walletBalance,
  onMax,
  onValueChange,
}: {
  token: PoolToken
  index: number
  disabled: boolean
  walletBalance?: LargeTokenInputProps['walletBalance']
  /** Spendable maximum used for amount validation and the Max chip. */
  max?: QueryProp<Decimal>
  /** Keep this input at its maximum as the quote refreshes. */
  isMaxSelected?: boolean
  /** Apply the token's maximum, including dependent updates when the Max chip or displayed balance is clicked. */
  onMax?: (index: number) => void
  /** Applies the amount edit and any dependent form updates. */
  onValueChange: (index: number, value: Decimal | undefined) => void
}) => {
  const { update, values, formState } = useFormContext<PoolForm>() // todo: pass form via prop after migration to tanstack forms
  const { errors, touchedFields } = formState
  const field = poolAmountField(index)
  const amount = values[field]
  const fieldError = touchedFields[field] ? (errors[field] ?? errors[poolMaxAmountField(index)]) : undefined
  useFormSync({ update }, { [poolMaxAmountField(index)]: max?.data }, !!max)
  useFormSync({ update }, { [field]: max?.data }, isMaxSelected && max?.data != null)
  const error = fieldError ?? max?.error
  return (
    <LargeTokenInput
      name={field}
      tokenSelector={
        <TokenLabel blockchainId={blockchainId} address={address} label={symbol} size="mui-md" disabled={disabled} />
      }
      balance={q({ data: amount, error: error ?? null, isLoading: false })}
      onBalance={useCallback((value: Decimal | undefined) => onValueChange(index, value), [index, onValueChange])}
      disabled={disabled}
      inputBalanceUsd={maybes([amount, usdRate], decimalMultiply)}
      walletBalance={walletBalance}
      maxBalance={max && { balance: max, chips: 'max', onMax: onMax && (() => onMax(index)) }}
      message={error?.message}
      testId={`pool-token-input-${address}`}
    />
  )
}
