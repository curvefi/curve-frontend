import { useCallback } from 'react'
import type { Address } from '@primitives/address.utils'
import { isComplete } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { LargeTokenInput, type LargeTokenInputProps } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LlamaIcon } from '@ui/icons/LlamaIcon'
import { decimalEqual } from '@ui/lib/decimal'
import { getBalancedAmounts } from './balanced-amounts.utils'
import { poolAmountField, type PoolForm, poolMaxAmountField } from './pool-form.utils'

export type PoolToken = {
  blockchainId: string | undefined
  address: Address
  symbol: string | undefined
  balance: QueryProp<Decimal>
}

const getBalancedUpdates = (reserves: Decimal[], decimals: number[], value: Decimal | undefined, index: number) =>
  fromEntries(
    getBalancedAmounts(reserves, decimals, value, index).map((amount, index) => [poolAmountField(index), amount]),
  )

export const PoolTokenInput = ({
  token: { blockchainId, address, balance, symbol },
  index,
  disabled,
  reserves: { data: reserves },
  max,
  isMaxSelected = false,
  positionBalance,
  onMax,
  onValueChange,
}: {
  token: PoolToken
  index: number
  disabled: boolean
  reserves: QueryProp<Decimal[]>
  /** Spendable maximum used for amount validation and the Max chip. */
  max?: QueryProp<Decimal>
  /** Keep this input at its maximum as the quote refreshes. */
  isMaxSelected?: boolean
  /** Apply the token's maximum, including dependent updates when the Max chip or displayed balance is clicked. */
  onMax?: (index: number) => void
  /** Called after an amount edit; Max selection is handled separately by onMax. */
  onValueChange?: (index: number, value: Decimal | undefined) => void
  /** Display the position balance instead of the wallet balance. */
  positionBalance?: {
    position: QueryProp<Decimal>
    tooltip?: NonNullable<LargeTokenInputProps['walletBalance']>['tooltip']
  }
}) => {
  const { update, watchValue, getValue, formState } = useFormContext<PoolForm>() // todo: pass form via prop after migration to tanstack forms
  const { errors, touchedFields } = formState
  const field = poolAmountField(index)
  const amount = watchValue(field)
  const fieldError = touchedFields[field] ? (errors[field] ?? errors[poolMaxAmountField(index)]) : undefined
  const { position, tooltip } = positionBalance ?? {}
  const limit = max ?? position
  useFormSync({ update }, { [poolMaxAmountField(index)]: limit?.data })
  useFormSync({ update }, { [field]: max?.data }, isMaxSelected && max?.data != null)
  const error = fieldError ?? limit?.error
  return (
    <LargeTokenInput
      name={field}
      tokenSelector={
        <TokenLabel blockchainId={blockchainId} address={address} label={symbol} size="mui-md" disabled={disabled} />
      }
      balance={q({ data: amount, error: error ?? null, isLoading: false })}
      onBalance={useCallback(
        (value: Decimal | undefined) => {
          if (onMax && value && +value && max?.data && decimalEqual(value, max.data)) return onMax(index)
          const decimals = getValue('decimals')
          update(
            getValue('isBalanced') && isComplete(reserves) && isComplete(decimals)
              ? getBalancedUpdates(reserves, decimals, value, index)
              : { [field]: value },
          )
          onValueChange?.(index, value)
        },
        [getValue, update, reserves, index, field, onMax, max?.data, onValueChange],
      )}
      disabled={disabled}
      walletBalance={{ symbol, balance: position ?? balance, tooltip, prefix: position && LlamaIcon }}
      maxBalance={max && { balance: max, chips: 'max', onMax: onMax && (() => onMax(index)) }}
      message={error?.message}
      testId={`pool-token-input-${address}`}
    />
  )
}
