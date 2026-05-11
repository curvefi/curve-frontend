import { useCallback, useMemo } from 'react'
// eslint-disable-next-line no-restricted-imports
import { DefaultValues, useForm as _useForm } from 'react-hook-form'
import { vestResolver } from '@hookform/resolvers/vest'
import type { ICreateResult } from '@hookform/resolvers/vest'
import { notFalsy, recordEntries } from '@primitives/objects.utils'
import type {
  ErrorKey,
  FieldPath,
  FieldValues,
  FormErrors,
  FormUpdates,
  PartialFields,
  UseFormReturn,
} from './form.types'

/**
 * Hook used to manage form state and validation. For now, simply delegates the call to react-hook-form.
 * This custom hook allows us to change the backend without changing the calling code.
 */
export const useForm = <T extends FieldValues = FieldValues>({
  defaultValues,
  validation,
}: {
  defaultValues: T
  validation?: ICreateResult<T>
}): UseFormReturn<T> => {
  const {
    handleSubmit,
    trigger,
    reset,
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { isSubmitting, errors, touchedFields, isDirty, isValid, dirtyFields },
  } = _useForm({
    defaultValues: defaultValues as DefaultValues<T>,
    resolver: validation && vestResolver(validation),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    resetOptions: { keepErrors: false },
    delayError: 150,
    criteriaMode: 'all',
  })

  return {
    handleSubmit: handleSubmit as UseFormReturn<T>['handleSubmit'],
    trigger,
    reset: useCallback(
      (valuesToReset: FormUpdates<T>): void => reset({ ...getValues(), ...valuesToReset }),
      [getValues, reset],
    ),
    watchValue: watch,
    watchValues: watch,
    getValues,
    getValue: getValues,
    /**
     * react-hook-form update helper that uses a fixed update policy and then runs a full `form.trigger()` once per call.
     * This is necessary because form.setValue() doesn't revalidate all fields.
     * Any validation in the form root or in other fields can leave the form in an invalid state.
     * We prefer to have this helper to force full revalidation to avoid silly mistakes that are hard to debug.
     * Direct `form.setValue()` / `form.trigger()` calls are lint-restricted.
     */
    updateForm: useCallback(
      (updates: FormUpdates<T>, { automated = false } = {}) => {
        const changes = recordEntries(updates).filter(([field, value]) => getValues(field) !== value)
        if (!changes.length) return // no changes, skip revalidation
        changes.forEach(([field, value]) =>
          setValue(field, value, {
            shouldValidate: false, // we revalidate just below.
            shouldDirty: !automated,
            shouldTouch: !automated,
          }),
        )
        trigger().catch((error: unknown) => console.error('updateForm(): form.trigger() failed', error))
      },
      [getValues, setValue, trigger],
    ),
    setError,
    clearErrors,
    isTouched: useCallback(
      (...fields: FieldPath<T>[]) => fields.some(field => field in touchedFields),
      [touchedFields],
    ),
    formState: {
      isSubmitting,
      errors: errors as FormErrors<T>,
      visibleErrors: useMemo(
        () =>
          notFalsy(
            ...recordEntries(errors)
              .filter(
                ([field, error]) => (field in touchedFields || (field.startsWith('root') && isDirty)) && error?.message,
              )
              .map(([field, error]) => [field, error!.message] as [ErrorKey<T>, string]),
          ),
        [errors, touchedFields, isDirty],
      ),
      touchedFields: touchedFields as PartialFields<T>,
      isDirty,
      isValid,
      dirtyFields: dirtyFields as PartialFields<T>,
    },
  }
}
