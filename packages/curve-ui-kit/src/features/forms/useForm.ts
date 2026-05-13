import { useCallback, useMemo } from 'react'
import { fromEntries, notFalsy, objectKeys, recordEntries } from '@primitives/objects.utils'
import { getBy, useForm as useTanStackForm, useStore } from '@tanstack/react-form'
import type { ValidationSuite } from '@ui-kit/lib/validation'
import type {
  ErrorKey,
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormError,
  PartialFields,
  RootFormError,
  UseFormReturn,
} from './form.types'

type FormLevelError<T extends FieldValues> = { form?: string; fields: Partial<Record<FieldPath<T>, string>> }
type FieldErrors<T extends FieldValues> = Partial<Record<FieldPath<T>, FormError>>
type DefinedUpdateEntry<T extends FieldValues> = [FieldPath<T>, FieldPathValue<T, FieldPath<T>>]
type FieldMetaMap<T extends FieldValues> = Partial<Record<FieldPath<T>, FieldMetaSnapshot>>
type FormErrorMap<T extends FieldValues> = { onSubmit?: FormError; onChange?: FormLevelError<T> }

type FieldMetaSnapshot = {
  isTouched: boolean
  isDirty: boolean
  errorMap: {
    onSubmit?: string | FormError
    onChange?: string | FormError
    onBlur?: string | FormError
    onMount?: string | FormError
  }
}

const toFormError = (value: string | FormError | undefined): FormError | undefined =>
  typeof value === 'string' ? { message: value } : value

const isServerError = (error: FormError | undefined): boolean => error?.type === 'server'

const collectFieldFlags = <T extends FieldValues>(
  fieldMeta: FieldMetaMap<T>,
  predicate: (meta: FieldMetaSnapshot) => boolean,
): PartialFields<T> =>
  fromEntries(
    recordEntries(fieldMeta)
      .filter(([, meta]) => !!meta && predicate(meta))
      .map(([field]) => [field, true]),
  )

const getPreferredError = (meta: FieldMetaSnapshot): FormError | undefined =>
  toFormError(meta.errorMap.onSubmit) ??
  toFormError(meta.errorMap.onChange) ??
  toFormError(meta.errorMap.onBlur) ??
  toFormError(meta.errorMap.onMount)

const toRootErrors = <T extends FieldValues>(errorMap: FormErrorMap<T> | undefined): RootFormError | undefined => {
  const submitError = errorMap?.onSubmit
  const general = isServerError(submitError)
    ? errorMap?.onChange?.form
      ? { message: errorMap.onChange.form }
      : undefined
    : (submitError ?? (errorMap?.onChange?.form ? { message: errorMap.onChange.form } : undefined))
  const serverError = isServerError(submitError) ? submitError : undefined
  return general || serverError ? { general, serverError } : undefined
}

const getFieldErrors = <T extends FieldValues>(
  fieldMeta: FieldMetaMap<T>,
  formErrorMap: FormErrorMap<T> | undefined,
): FieldErrors<T> =>
  fromEntries(
    notFalsy(
      ...recordEntries(fieldMeta).map(([field, meta]) => {
        const error = getPreferredError(meta)
        return error ? ([field, error] as const) : undefined
      }),
      ...(formErrorMap?.onChange
        ? notFalsy(
            ...recordEntries(formErrorMap.onChange.fields).map(([field, error]) =>
              error ? ([field, { message: error }] as const) : undefined,
            ),
          )
        : []),
    ),
  )

const getVisibleErrors = <T extends FieldValues>(
  fieldErrors: FieldErrors<T>,
  rootErrors: RootFormError | undefined,
  touchedFields: PartialFields<T>,
  dirtyFields: PartialFields<T>,
): [ErrorKey<T>, string][] => [
  ...recordEntries(fieldErrors)
    .filter(([field]) => touchedFields[field] === true)
    .map(([field, error]) => [field, error.message] as [ErrorKey<T>, string]),
  ...(objectKeys(dirtyFields).length
    ? notFalsy<[ErrorKey<T>, string]>(
        rootErrors?.general?.message ? ['root', rootErrors.general.message] : undefined,
        rootErrors?.serverError?.message ? ['root.serverError', rootErrors.serverError.message] : undefined,
      )
    : []),
]

/**
 * `getBy` preserves runtime path lookup but returns `any`, so we reattach the path-based type here.
 * This keeps `watchValue` reactive without changing the external API.
 */
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
  const form = useTanStackForm({
    defaultValues,
    ...(validation && {
      validators: {
        onChange: ({ value }: { value: T }) => ({ fields: validation(value).getErrors() }),
      },
    }),
  })

  const values = useStore(form.store, state => state.values)
  /** TanStack field meta carries validator-specific payload types; this wrapper only needs touched/dirty/errorMap. */
  const fieldMeta = useStore(form.store, state => state.fieldMeta as FieldMetaMap<T>)
  /** TanStack form error maps are also validator-shaped; this wrapper narrows them to the parts it reads. */
  const formErrorMap = useStore(form.store, state => state.errorMap as FormErrorMap<T> | undefined)

  const touchedFields = useMemo(() => collectFieldFlags(fieldMeta, meta => meta.isTouched), [fieldMeta])
  const dirtyFields = useMemo(() => collectFieldFlags(fieldMeta, meta => meta.isDirty), [fieldMeta])
  const fieldErrors = useMemo(() => getFieldErrors(fieldMeta, formErrorMap), [fieldMeta, formErrorMap])
  const rootErrors = useMemo(() => toRootErrors<T>(formErrorMap), [formErrorMap])

  return {
    handleSubmit: useCallback(
      onSubmit => () => form.handleSubmit({ onSubmit: ({ value }: { value: T }) => onSubmit(value) }),
      [form],
    ),
    reset: useCallback(valuesToReset => form.reset({ ...(form.state.values as T), ...valuesToReset }), [form]),
    watchValue: useCallback(
      <TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField> => watchFieldValue(values, field),
      [values],
    ),
    watchValues: useCallback(() => values as T, [values]),
    getValues: useCallback(() => form.state.values as T, [form]),
    getValue: useCallback(
      // TanStack returns `DeepValue`, while this wrapper exposes its own path-value alias.
      // They are the same runtime lookup, but TypeScript cannot connect those generic path systems.
      <TField extends FieldPath<T>>(field: TField): FieldPathValue<T, TField> =>
        form.getFieldValue(field) as FieldPathValue<T, TField>,
      [form],
    ),
    update: useCallback(
      (updates, { automated = false } = {}) => {
        const changedEntries = objectKeys(updates)
          .map(field => [field, updates[field]] as const)
          .filter(([field, value]) => form.getFieldValue(field) !== value) as DefinedUpdateEntry<T>[]

        changedEntries.forEach(([field, value]) =>
          form.setFieldValue(field, value as never, {
            dontValidate: true,
            dontRunListeners: true,
            dontUpdateMeta: automated,
          }),
        )

        if (changedEntries.length)
          Promise.resolve(form.validate('change')).catch(e => console.error('form update validation failed', e))
      },
      [form],
    ),
    setError: useCallback(
      (field, error) =>
        field === 'root'
          ? form.setErrorMap({ onSubmit: { form: error, fields: {} } })
          : field === 'root.serverError'
            ? form.setErrorMap({ onSubmit: { form: { ...error, type: 'server' }, fields: {} } })
            : form.setFieldMeta(field, prev => ({ ...prev, errorMap: { ...prev?.errorMap, onSubmit: error } })),
      [form],
    ),
    clearErrors: useCallback(
      field =>
        field === 'root' || field === 'root.serverError'
          ? form.setErrorMap({ onSubmit: undefined })
          : form.setFieldMeta(field, prev => ({ ...prev, errorMap: { ...prev?.errorMap, onSubmit: undefined } })),
      [form],
    ),
    isTouched: useCallback((...fields) => fields.some(field => touchedFields[field] === true), [touchedFields]),
    formState: {
      isSubmitting: useStore(form.store, state => state.isSubmitting),
      errors: useMemo<UseFormReturn<T>['formState']['errors']>(
        () =>
          (rootErrors
            ? { ...fieldErrors, root: rootErrors }
            : { ...fieldErrors }) as UseFormReturn<T>['formState']['errors'],
        [fieldErrors, rootErrors],
      ),
      visibleErrors: useMemo(
        () => getVisibleErrors(fieldErrors, rootErrors, touchedFields, dirtyFields),
        [fieldErrors, rootErrors, touchedFields, dirtyFields],
      ),
      touchedFields,
      isDirty: useStore(form.store, state => state.isDirty),
      isValid: useStore(form.store, state => state.isValid),
      dirtyFields,
    },
  }
}
