import type { SubmitEvent } from 'react'
import { type PartialRecord } from '@primitives/objects.utils'
import type { DeepKeys, DeepValue } from '@tanstack/react-form'

/** The base type for form fields. */
export type FieldValues = object
/** Field key in a possibly nested form. */
export type FieldPath<T extends FieldValues> = DeepKeys<T> & string
/** Field value in a possibly nested form. */
export type FieldPathValue<T extends FieldValues, TFieldPath extends FieldPath<T>> = DeepValue<T, TFieldPath>
/** Field paths for all nested fields with a given TValue type **/
export type FieldPathByValue<T extends FieldValues, TValue> = {
  [K in FieldPath<T>]: FieldPathValue<T, K> extends TValue ? K : never
}[FieldPath<T>]
/** Base type for form errors. */
export type FormError = { type?: string; message: string }
/** Key for form errors, which includes all field paths and the special 'root' key. */
export type ErrorKey<T extends FieldValues> = FieldPath<T> | 'root'
/** Base type for field errors, including only the field errors without the 'root' key */
export type FieldErrors<T extends FieldValues = FieldValues> = PartialRecord<FieldPath<T>, FormError>
/** Base type for form errors, including all field errors and the root error */
export type FormErrors<T extends FieldValues = FieldValues> = FieldErrors<T> & { root?: FormError }
/** Base type for field flags, indicating which fields have been interacted with */
export type FieldFlags<T extends FieldValues> = PartialRecord<FieldPath<T>, true>

export type FormState<T extends FieldValues> = {
  isSubmitting: boolean
  errors: FormErrors<T>
  visibleErrors: [ErrorKey<T>, string][]
  touchedFields: FieldFlags<T>
  isDirty: boolean
  isValid: boolean
  dirtyFields: FieldFlags<T>
}

/**
 * The type of the handleSubmit function returned by the useForm hook.
 * TODO: make `event` required, that requires changing old forms to use <form> instead of just a <button>
 **/
export type UseFormHandleSubmit<T extends FieldValues = FieldValues> = (
  onSubmit: (data: T) => Promise<void> | void,
) => (event?: SubmitEvent<HTMLFormElement>) => Promise<void> | void

/** A partial record with field updates. */
export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

/** The value returned by the useForm hook. */
export type UseFormReturn<T extends FieldValues = FieldValues> = {
  handleSubmit: UseFormHandleSubmit<T>
  reset: (userDefaultValues?: FormUpdates<T>) => void
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
