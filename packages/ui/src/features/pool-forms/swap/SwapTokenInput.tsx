import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { SwapTokenSelector } from '@ui/features/pool-forms/swap/SwapTokenSelector'
import { q, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolToken } from '../PoolTokenInput'
import { SWAP_FIELDS, type SwapFormValues, type SwapSide } from './swap-form.utils'

const INPUT_BY_SIDE = {
  pay: { label: t`You pay`, testId: 'pool-swap-pay', selectorLabel: t`Token to sell` },
  receive: { label: t`You receive (estimated)`, testId: 'pool-swap-receive', selectorLabel: t`Token to receive` },
} as const

export const SwapTokenInput = ({
  form,
  tokens,
  side,
  balance,
  disabled,
}: {
  form: UseFormReturn<SwapFormValues>
  tokens: QueryProp<PoolToken>[] | undefined
  side: SwapSide
  balance: QueryProp<Decimal>
  disabled: boolean
}) => {
  const { amountField: name, amountIndexField, calculatedIndexField } = SWAP_FIELDS[side]
  const { label, testId, selectorLabel } = INPUT_BY_SIDE[side]
  const values = form.watchValues()
  const { data: token, error: tokenError } = tokens?.[values[amountIndexField]] ?? {}
  const error = (form.isTouched('inputAmount', 'outputAmount') ? form.formState.errors[name] : undefined) ?? tokenError

  return (
    <LargeTokenInput
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        <SwapTokenSelector
          tokens={tokens}
          selectedIndex={values[amountIndexField]}
          disabled={disabled}
          label={selectorLabel}
          calculatedIndex={values[calculatedIndexField]}
          onToken={index => form.update({ [amountIndexField]: index })}
        />
      }
      balance={q({ ...balance, data: values[name], error: error ?? balance.error })}
      onBalance={amount => {
        const updates: Partial<SwapFormValues> = { [name]: amount, editedSide: side }
        form.update(updates)
      }}
      walletBalance={token && { symbol: token.symbol, balance: token.balance }}
      {...(side === 'pay' && token && { maxBalance: { balance: token.balance, chips: 'max' } })}
      message={error?.message}
      disabled={disabled}
    />
  )
}
