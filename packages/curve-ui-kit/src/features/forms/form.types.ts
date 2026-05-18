import type { SubmitEventHandler } from 'react'
import { type PartialRecord } from '@primitives/objects.utils'
import type { DeepKeys, DeepValue } from '@tanstack/react-form'

export type FieldValues = object
export type FieldPath<T extends FieldValues> = DeepKeys<T> & string
export type FieldPathValue<T extends FieldValues, TFieldPath extends FieldPath<T>> = DeepValue<T, TFieldPath>
export type FieldRecord<T extends FieldValues, TValue> = PartialRecord<FieldPath<T>, TValue>
export type FieldEntry<T extends FieldValues> = {
  [K in FieldPath<T>]: [K, FieldPathValue<T, K>]
}[FieldPath<T>]
export type FieldRecordEntry<T extends FieldValues, TValue> = {
  [K in FieldPath<T>]: [K, TValue]
}[FieldPath<T>]
export type FieldPathByValue<T extends FieldValues, TValue> = {
  [K in FieldPath<T>]: FieldPathValue<T, K> extends TValue ? K : never
}[FieldPath<T>]
export type FormError = { type?: string; message: string }
export type ErrorKey<T extends FieldValues> = FieldPath<T> | 'root'
export type FormErrors<T extends FieldValues = FieldValues> = FieldRecord<T, FormError> & {
  root?: FormError
}
export type PartialFields<T extends FieldValues> = FieldRecord<T, true>

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
) => SubmitEventHandler<HTMLFormElement>

export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

export type FormUpdateEntry<TFieldValues extends FieldValues> = FieldEntry<TFieldValues>

/** The value returned by the useForm hook. */
export type UseFormReturn<T extends FieldValues = FieldValues> = {
  handleSubmit: UseFormHandleSubmit<T>
  reset: (userDefaultValues: FormUpdates<T>) => void
  watchValues: () => T
  watchValue<TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField>
  getValues: () => T
  getValue<TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField>
  update(updates: FormUpdates<T>, options?: { automated?: true }): void
  setError: (field: FieldPath<T>, error: FormError) => void
  clearErrors: (field: FieldPath<T>) => void
  setRootError: (error: FormError) => void
  clearRootError: () => void
  isTouched: (...fields: FieldPath<T>[]) => boolean
  formState: FormState<T>
}
