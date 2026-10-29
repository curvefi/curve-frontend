import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import { PoolTokenSelector } from '@ui/features/pool-forms/PoolTokenSelector'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalMultiply } from '@ui/lib/decimal'
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
  const { values } = form
  const { data: token, error: tokenError } = tokens?.[values[amountIndexField]] ?? {}

  return (
    <FormTokenInput
      form={form}
      name={name}
      relatedFields={[{ field: [name], ignoreTouched: true }]}
      label={label}
      testId={testId}
      tokenSelector={
        <PoolTokenSelector
          tokens={tokens}
          selectedIndex={values[amountIndexField]}
          disabled={disabled}
          label={selectorLabel}
          excludedIndex={values[calculatedIndexField]}
          onToken={index => form.update({ [amountIndexField]: index })}
        />
      }
      balance={q({ ...balance, error: tokenError ?? balance.error })}
      onBalance={amount => {
        const updates: Partial<SwapFormValues> = { [name]: amount, editedSide: side }
        form.update(updates)
      }}
      inputBalanceUsd={maybes([values[name], token?.usdRate], decimalMultiply)}
      walletBalance={token && { symbol: token.symbol, balance: token.balance }}
      {...(side === 'pay' && token && { max: { balance: token.balance } })}
      disabled={disabled}
    />
  )
}
