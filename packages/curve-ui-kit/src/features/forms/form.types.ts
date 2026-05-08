/* eslint-disable no-restricted-imports */
import { type FieldValues, type Path, type PathValue } from 'react-hook-form'
import { type PartialRecord } from '@primitives/objects.utils'

export { type FieldValues, type FieldPathByValue } from 'react-hook-form'

export type FieldPath<T extends FieldValues> = Path<T>
export type FieldPathValue<T extends FieldValues, TFieldPath extends FieldPath<T>> = PathValue<T, TFieldPath>
export type ErrorKey<T extends FieldValues> = FieldPath<T> | 'root' | `root.serverError`
export type FormErrors<T extends FieldValues = FieldValues> = PartialRecord<ErrorKey<T>, Error>
export type PartialFields<T extends FieldValues> = PartialRecord<FieldPath<T>, true>

export type FormState<T extends FieldValues> = {
  isSubmitting: boolean
  errors: FormErrors<T>
  visibleErrors: [ErrorKey<T>, string][]
  touchedFields: PartialFields<T>
  isDirty: boolean
  isValid: boolean
  dirtyFields: PartialFields<T>
}

export type UseFormHandleSubmit<T extends FieldValues = FieldValues> = (
  onSubmit: (data: T) => Promise<void> | void,
) => () => Promise<void> | void

export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

/** The value returned by the useForm hook. */
export type UseFormReturn<T extends FieldValues = FieldValues> = {
  handleSubmit: UseFormHandleSubmit<T>
  trigger: (field?: FieldPath<T>) => Promise<boolean>
  reset: (userDefaultValues: FormUpdates<T>) => void
  watchValues: () => T
  watchValue<TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField>
  getValues: () => T
  getValue<TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField>
  updateForm(updates: FormUpdates<T>, options?: { automated?: boolean }): void
  setError: (field: ErrorKey<T>, error: Error | { type?: 'server' | 'manual'; message: string }) => void
  clearErrors: (field: ErrorKey<T>) => void
  isTouched: (...fields: FieldPath<T>[]) => boolean
  formState: FormState<T>
}
