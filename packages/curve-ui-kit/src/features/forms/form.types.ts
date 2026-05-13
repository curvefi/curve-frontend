import { type PartialRecord } from '@primitives/objects.utils'

export type FieldValues = object
export type FieldPath<T extends FieldValues> = Extract<keyof T, string>
export type FieldPathValue<T extends FieldValues, TFieldPath extends FieldPath<T>> = T[TFieldPath]
export type FieldPathByValue<T extends FieldValues, TValue> = {
  [K in Extract<keyof T, string>]: T[K] extends TValue ? K : never
}[Extract<keyof T, string>]
export type FormError = { type?: string; message: string }
export type RootFormError = { general?: FormError; serverError?: FormError }
export type ErrorKey<T extends FieldValues> = FieldPath<T> | 'root' | `root.serverError`
export type FormErrors<T extends FieldValues = FieldValues> = PartialRecord<FieldPath<T>, FormError> & {
  root?: RootFormError
}
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
  reset: (userDefaultValues: FormUpdates<T>) => void
  watchValues: () => T
  watchValue<TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField>
  getValues: () => T
  getValue<TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField>
  update(updates: FormUpdates<T>, options?: { automated?: true }): void
  setError: (field: ErrorKey<T>, error: FormError) => void
  clearErrors: (field: ErrorKey<T>) => void
  isTouched: (...fields: FieldPath<T>[]) => boolean
  formState: FormState<T>
}
