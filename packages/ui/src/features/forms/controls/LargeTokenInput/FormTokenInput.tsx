import type { Decimal } from '@primitives/decimal.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import type { FieldPath, FieldPathByValue, FieldValues, UseFormReturn } from '@ui/features/forms'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LargeTokenInput, type LargeTokenInputProps } from './LargeTokenInput'

/**
 * Binds a token input to a form value, using balance query loading/error state and an optional maximum.
 * Touched-field errors take precedence over query errors, which take precedence over the helper message.
 * Related-field errors appear when either the input or the related field is touched, unless ignoreTouched is set.
 */
export const FormTokenInput = <TValues extends FieldValues>({
  form: {
    values,
    formState: { errors, touchedFields },
  },
  name,
  relatedFields,
  max,
  balance,
  message,
  ...props
}: Omit<LargeTokenInputProps, 'name' | 'balance' | 'maxBalance'> & {
  form: Pick<UseFormReturn<TValues>, 'values' | 'formState'>
  name: FieldPathByValue<TValues, Decimal | undefined>
  relatedFields?: (FieldPath<TValues> | { field: FieldPath<TValues>[]; ignoreTouched: true })[]
  max?: Pick<NonNullable<LargeTokenInputProps['maxBalance']>, 'chips' | 'onMax'> & { balance: QueryProp<Decimal> }
  balance?: QueryProp<Decimal>
}) => {
  const error =
    notFalsyArray([name], relatedFields)
      .map(f =>
        typeof f === 'string'
          ? (name in touchedFields || f in touchedFields) && errors[f]
          : f.field.map(name => errors[name]).find(Boolean),
      )
      .find(error => !!error) ??
    balance?.error ??
    max?.balance.error ??
    null
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
