import { useCallback } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { useFormContext, useFormSync } from '@ui/features/forms'
import { LargeTokenInput, type LargeTokenInputProps } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LlamaIcon } from '@ui/icons/LlamaIcon'
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
  hideMaxButton,
  reserves: { data: reserves },
  positionBalance,
}: {
  token: PoolToken
  index: number
  disabled: boolean
  hideMaxButton?: boolean
  reserves: QueryProp<Decimal[]>
  /** Display the position balance instead of the wallet balance, as in LoanFormTokenInput. */
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
  const maxBalance = position ?? balance
  useFormSync({ update }, { [poolMaxAmountField(index)]: maxBalance.data })
  const inputError = fieldError ?? maxBalance.error
  return (
    <LargeTokenInput
      name={field}
      tokenSelector={
        <TokenLabel blockchainId={blockchainId} address={address} label={symbol} size="mui-md" disabled={disabled} />
      }
      balance={q({ data: amount, error: inputError ?? null, isLoading: false })}
      onBalance={useCallback(
        (value: Decimal | undefined) => {
          const decimals = getValue('decimals')
          update(
            getValue('isBalanced') && reserves?.every(reserve => +reserve) && decimals?.every(value => value != null)
              ? getBalancedUpdates(reserves, decimals, value, index)
              : { [field]: value },
          )
        },
        [getValue, update, reserves, index, field],
      )}
      disabled={disabled}
      walletBalance={{ symbol, balance: position ?? balance, tooltip, prefix: position && LlamaIcon }}
      {...(!hideMaxButton && { maxBalance: { balance: maxBalance, chips: 'max' } })}
      message={inputError?.message}
      testId={`pool-token-input-${address}`}
    />
  )
}
