import type { Decimal } from '@primitives/decimal.utils'
import { notFalsyArray } from '@primitives/objects.utils'
import type { FormControl } from '@ui/features/forms/useFormValidation'
import { q, type QueryProp } from '@ui/features/queries/util'
import type { FieldName } from '@ui/lib/validation/types'
import { LargeTokenInput, type LargeTokenInputProps } from './LargeTokenInput'

type RelatedField<TFieldName extends string = string> = TFieldName | { field: TFieldName[]; ignoreTouched: boolean }

/**
 * Binds a token input to a form value, using balance query loading/error state and an optional maximum.
 * Touched-field errors take precedence over query errors, which take precedence over the helper message.
 * Related-field errors appear when either the input or the related field is touched, unless ignoreTouched is set.
 */
export const FormTokenInput = <
  TForm extends Pick<FormControl<Record<TFieldName, Decimal | undefined>>, 'values' | 'formState'>,
  TFieldName extends string,
>({
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
  form: TForm
  name: TFieldName
  relatedFields?: RelatedField<FieldName<TForm['formState']['errors']>>[]
  max?: Pick<NonNullable<LargeTokenInputProps['maxBalance']>, 'chips' | 'onMax'> & { balance: QueryProp<Decimal> }
  balance?: QueryProp<Decimal>
}) => {
  const error =
    notFalsyArray<RelatedField>([name], relatedFields)
      .map(f =>
        typeof f === 'string'
          ? (name in touchedFields || f in touchedFields) && errors[f]
          : f.field
              .map(field => (f.ignoreTouched || name in touchedFields || field in touchedFields) && errors[field])
              .find(Boolean),
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
