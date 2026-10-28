import type { Decimal } from '@primitives/decimal.utils'
import type { FieldPathByValue, FieldValues, UseFormReturn } from '@ui/features/forms'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LargeTokenInput, type LargeTokenInputProps } from './LargeTokenInput'

/**
 * Binds a token input to a form value, using balance query loading/error state and an optional maximum.
 * Touched-field errors take precedence over query errors, which take precedence over the helper message.
 */
export const FormTokenInput = <TValues extends FieldValues>({
  form: {
    values,
    formState: { errors, touchedFields },
  },
  name,
  max,
  balance,
  message,
  ...props
}: Omit<LargeTokenInputProps, 'name' | 'balance' | 'maxBalance'> & {
  form: Pick<UseFormReturn<TValues>, 'values' | 'formState'>
  name: FieldPathByValue<TValues, Decimal | undefined>
  max?: Pick<NonNullable<LargeTokenInputProps['maxBalance']>, 'chips' | 'onMax'> & {
    balance: QueryProp<Decimal>
    field?: FieldPathByValue<TValues, Decimal | undefined>
  }
  balance?: QueryProp<Decimal>
}) => {
  const fieldError = name in touchedFields ? (errors[name] ?? (max?.field ? errors[max.field] : undefined)) : undefined
  const error = fieldError ?? balance?.error ?? max?.balance.error ?? null
  return (
    <LargeTokenInput
      {...props}
      name={name}
      balance={q({ data: values[name], error, isLoading: balance?.isLoading ?? false })}
      maxBalance={max && { balance: max.balance, chips: max.chips ?? 'max', onMax: max.onMax }}
      message={error?.message ?? message}
    />
  )
}
