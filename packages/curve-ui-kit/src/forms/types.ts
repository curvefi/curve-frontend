import {
  type FieldPathByValue as _FieldPathByValue,
  type FieldValues as _FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form'
import type { PartialRecord } from '@primitives/objects.utils'

export type FieldValues = _FieldValues
export type FieldPath<T extends FieldValues> = Path<T>
export type FieldPathByValue<T extends FieldValues, TValue> = _FieldPathByValue<T, TValue>
export type FieldPathValue<T extends FieldValues, TFieldPath extends FieldPath<T>> = PathValue<T, TFieldPath>
export type ErrorKey<T extends FieldValues> = FieldPath<T> | 'root'
export type FormErrors<T extends FieldValues = FieldValues> = PartialRecord<ErrorKey<T>, Error>
export type PartialFields<T extends FieldValues> = PartialRecord<FieldPath<T>, true>

export type FormState<T extends FieldValues> = {
  isSubmitting: boolean
  errors: FormErrors<T>
  touchedFields: PartialFields<T>
  isDirty: boolean
  isValid: boolean
  dirtyFields: PartialFields<T>
}

export type UseFormReturn<T extends FieldValues = FieldValues> = {
  values: T
  handleSubmit: (onSubmit: (data: T) => Promise<void> | void) => () => Promise<void> | void
  trigger: (field?: FieldPath<T>) => void
  reset: (values?: T) => void
  watch: <TField extends FieldPath<T>>(field: TField) => FieldPathValue<T, TField>
  getValues: <TField extends FieldPath<T>>(field: TField) => FieldPathValue<T, TField>
  setValue: (
    field: FieldPath<T>,
    value: T[keyof T],
    options?: {
      shouldValidate?: boolean
      shouldDirty?: boolean
      shouldTouch?: boolean
    },
  ) => void
  setError: (field: ErrorKey<T>, error: Error | { type?: 'server' | 'manual'; message: string }) => void
  clearErrors: (field: ErrorKey<T>) => void
  formState: FormState<T>
}
