import { type SubmitEvent, useCallback, useMemo, useRef } from 'react'
import { assert, fromEntries, notFalsy, notFalsyArray, objectKeys, recordEntries } from '@primitives/objects.utils'
import { type AnyFieldMeta, getBy, useForm as useTanStackForm, useStore } from '@tanstack/react-form'
import type { ValidationSuite } from '@ui-kit/lib/validation'
import type {
  ErrorKey,
  FieldErrors,
  FieldFlags,
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormError,
  FormErrors,
  UseFormReturn,
} from './form.types'

/** Picked fields from tanstack meta used to retrieve form errors **/
type FieldMetaSnapshot = Pick<AnyFieldMeta, 'isTouched' | 'isDirty' | 'errorMap'>
/** A map of field meta data for some fields of the form */
type FieldMetaMap<T extends FieldValues> = Partial<Record<FieldPath<T>, FieldMetaSnapshot>>

/** Converts the given value to a form error if it is a string or an object with a message property */
const toFormError = (value: unknown): FormError | undefined =>
  typeof value === 'string'
    ? { message: value }
    : value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
      ? {
          message: value.message,
          ...('type' in value && typeof value.type === 'string' ? { type: value.type } : {}),
        }
      : undefined

/** Converts the given validation errors to a form error string */
const getValidationFieldErrors = <T extends FieldValues>(validation: ValidationSuite, value: T) =>
  fromEntries(
    recordEntries(validation(value).getErrors()).map(([field, errors]) => [field as FieldPath<T>, errors.join('\n')]),
  )

/** Collects field flags based on a predicate function applied to field metadata */
const collectFieldFlags = <T extends FieldValues>(
  fieldMeta: FieldMetaMap<T>,
  predicate: (meta: FieldMetaSnapshot) => boolean,
): FieldFlags<T> =>
  fromEntries(
    recordEntries(fieldMeta)
      .filter(([, meta]) => !!meta && predicate(meta))
      .map(([field]) => [field, true]),
  )

/** Retrieves the 'root' error from the form error map */
const toRootError = ({ onSubmit: submitError }: { onSubmit?: unknown }): FormError | undefined =>
  submitError && typeof submitError === 'object' && 'form' in submitError
    ? toFormError(submitError.form)
    : toFormError(submitError)

/** Retrieves field errors from field metadata */
const getFieldErrors = <T extends FieldValues>(fieldMeta: FieldMetaMap<T>): FieldErrors<T> =>
  fromEntries(
    notFalsy(
      ...recordEntries(fieldMeta).map(([field, { errorMap }]) => {
        const { onBlur, onChange, onMount, onSubmit } = errorMap
        const error = toFormError(onSubmit) ?? toFormError(onChange) ?? toFormError(onBlur) ?? toFormError(onMount)
        return error && ([field, error] as [FieldPath<T>, FormError])
      }),
    ),
  )

const getVisibleErrors = <T extends FieldValues>(
  fieldErrors: FieldErrors<T>,
  rootError: FormError | undefined,
  touchedFields: FieldFlags<T>,
  dirtyFields: FieldFlags<T>,
): [ErrorKey<T>, string][] => [
  ...recordEntries(fieldErrors)
    .filter(([field]) => touchedFields[field])
    .map(([field, error]): [ErrorKey<T>, string] => [field, error.message]),
  ...notFalsyArray(
    objectKeys(dirtyFields).length && notFalsy<['root', string]>(rootError ? ['root', rootError.message] : undefined),
  ),
]

const watchFieldValue = <T extends FieldValues, TField extends FieldPath<T>>(
  values: T,
  field: TField,
): FieldPathValue<T, TField> => getBy(values, field) as FieldPathValue<T, TField>

/**
 * TanStack Form spike behind the existing wrapper API.
 */
export const useForm = <T extends FieldValues = FieldValues>({
  defaultValues,
  validation,
}: {
  defaultValues: T
  validation?: ValidationSuite
}): UseFormReturn<T> => {
  // mutate resets form, but form submits mutation, so we need a ref to avoid circular dependency
  // that could be cleaned up in the future by letting the form reset itself after successful submission
  const mutateRef = useRef<(data: T) => void | Promise<void>>(null)

  const form = useTanStackForm({
    defaultValues,
    ...(validation && {
      validators: {
        onChange: ({ value }: { value: T }) => ({ fields: getValidationFieldErrors(validation, value) }),
      },
    }),
    onSubmit: ({ value }: { value: T }) => assert(mutateRef.current, `No submit handler provided`)(value),
  })

  const values = useStore(form.store, state => state.values)
  const fieldMeta = useStore(form.store, state => state.fieldMeta)
  const formErrorMap = useStore(form.store, (state): { onSubmit?: unknown } => state.errorMap)

  const touchedFields = useMemo(() => collectFieldFlags(fieldMeta, meta => meta.isTouched), [fieldMeta])
  const dirtyFields = useMemo(() => collectFieldFlags(fieldMeta, meta => meta.isDirty), [fieldMeta])
  const fieldErrors = useMemo(() => getFieldErrors(fieldMeta), [fieldMeta])
  const rootError = useMemo(() => toRootError(formErrorMap), [formErrorMap])

  return {
    handleSubmit: useCallback(
      mutate => (event?: SubmitEvent<HTMLFormElement>) => {
        event?.preventDefault()
        event?.stopPropagation()
        mutateRef.current = mutate
        return form.handleSubmit()
      },
      [form],
    ),
    reset: useCallback(valuesToReset => form.reset({ ...form.state.values, ...valuesToReset }), [form]),
    watchValue: useCallback(<TField extends FieldPath<T>>(field: TField) => watchFieldValue(values, field), [values]),
    watchValues: useCallback(() => values, [values]),
    getValues: useCallback(() => form.state.values, [form]),
    getValue: useCallback(<TField extends FieldPath<T>>(field: TField) => form.getFieldValue(field), [form]),
    update: useCallback(
      (updates, { automated: dontUpdateMeta = false } = {}) => {
        const changes = recordEntries(updates).filter(([field, value]) => form.getFieldValue(field) !== value)
        changes.forEach(([field, value]) =>
          form.setFieldValue(field, value as never, { dontValidate: true, dontRunListeners: true, dontUpdateMeta }),
        )
        if (changes.length) {
          Promise.resolve(form.validate('change')).catch(e => console.error('form update validation failed', e))
        }
      },
      [form],
    ),
    setError: useCallback(
      (field, onSubmit) => form.setFieldMeta(field, prev => ({ ...prev, errorMap: { ...prev.errorMap, onSubmit } })),
      [form],
    ),
    clearErrors: useCallback(
      field => form.setFieldMeta(field, prev => ({ ...prev, errorMap: { ...prev?.errorMap, onSubmit: undefined } })),
      [form],
    ),
    setRootError: useCallback(error => form.setErrorMap({ onSubmit: { form: error, fields: {} } }), [form]),
    clearRootError: useCallback(() => form.setErrorMap({ onSubmit: undefined }), [form]),
    isTouched: useCallback((...fields) => fields.some(field => touchedFields[field] === true), [touchedFields]),
    formState: {
      isSubmitting: useStore(form.store, state => state.isSubmitting),
      errors: useMemo<FormErrors<T>>(
        () => ({ ...fieldErrors, ...(rootError && { root: rootError }) }),
        [fieldErrors, rootError],
      ),
      visibleErrors: useMemo(
        () => getVisibleErrors(fieldErrors, rootError, touchedFields, dirtyFields),
        [fieldErrors, rootError, touchedFields, dirtyFields],
      ),
      touchedFields,
      isDirty: useStore(form.store, state => state.isDirty),
      isValid: useStore(form.store, state => state.isValid),
      dirtyFields,
    },
  }
}
