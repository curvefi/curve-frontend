import type { Decimal } from '@primitives/decimal.utils'
import type { FieldPathByValue, FieldValues, UseFormReturn } from '@ui/features/forms'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LargeTokenInput, type LargeTokenInputProps } from './LargeTokenInput'

// TODO: Reuse in LoanFormTokenInput, SwapTokenInput, RefuelForm and deposit-gauge-reward/AmountTokenInput;
// preserve their wallet queries, related-field errors and calculated-input loading states.
export const FormTokenInput = <TValues extends FieldValues>({
  form: {
    values,
    formState: { errors, touchedFields },
  },
  name,
  max,
  maxField,
  onMax,
  error: queryError,
  ...props
}: Omit<LargeTokenInputProps, 'name' | 'balance' | 'maxBalance' | 'message'> & {
  form: UseFormReturn<TValues>
  name: FieldPathByValue<TValues, Decimal | undefined>
  max?: QueryProp<Decimal>
  maxField?: FieldPathByValue<TValues, Decimal | undefined>
  onMax?: (amount: Decimal | undefined) => void
  error?: Error | null
}) => {
  const fieldError = name in touchedFields ? (errors[name] ?? (maxField ? errors[maxField] : undefined)) : undefined
  const error = fieldError ?? queryError ?? max?.error
  return (
    <LargeTokenInput
      {...props}
      name={name}
      balance={q({ data: values[name], error: error ?? null, isLoading: false })}
      maxBalance={max && { balance: max, chips: 'max', onMax }}
      message={error?.message}
    />
  )
}
