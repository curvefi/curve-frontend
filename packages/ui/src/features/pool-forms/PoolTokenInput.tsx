import { useCallback } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { useFormSync, type FieldPathByValue, type UseFormReturn } from '@ui/features/forms'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import type { QueryProp } from '@ui/features/queries/util'
import { decimalMultiply } from '@ui/lib/decimal'
import type { LargeTokenInputProps } from '../forms/controls/LargeTokenInput/LargeTokenInput'
import { poolAmountField, poolMaxAmountField, type PoolForm, type PoolTokenFields } from './pool-form.utils'

export type PoolToken = {
  blockchainId: string | undefined
  address: Address
  symbol: string | undefined
  balance: QueryProp<Decimal>
  usdRate: number | undefined
}

export const PoolTokenInput = <TValues extends PoolForm>({
  form,
  token: { blockchainId, address, symbol, usdRate },
  index,
  disabled,
  max,
  isMaxSelected = false,
  walletBalance,
  onMax,
  onValueChange,
}: {
  form: UseFormReturn<TValues> & Pick<UseFormReturn<PoolTokenFields>, 'update'>
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
  const { values } = form
  const field = poolAmountField(index)
  const maxField = poolMaxAmountField(index)
  const amount = values[field]
  useFormSync<PoolTokenFields>(form, {
    [maxField]: max ? max.data : values[maxField],
    [field]: isMaxSelected ? max?.data : amount,
  })
  return (
    <FormTokenInput
      form={form}
      name={field as FieldPathByValue<TValues, Decimal | undefined>}
      max={max}
      maxField={maxField as FieldPathByValue<TValues, Decimal | undefined>}
      onMax={onMax && (() => onMax(index))}
      tokenSelector={
        <TokenLabel blockchainId={blockchainId} address={address} label={symbol} size="mui-md" disabled={disabled} />
      }
      onBalance={useCallback((value: Decimal | undefined) => onValueChange(index, value), [index, onValueChange])}
      disabled={disabled}
      inputBalanceUsd={maybes([amount, usdRate], decimalMultiply)}
      walletBalance={walletBalance}
      testId={`pool-token-input-${address}`}
    />
  )
}
