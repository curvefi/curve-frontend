import { useCallback } from 'react'
import { DefaultValues, type ResolverOptions, type ResolverResult, useForm as _useForm } from 'react-hook-form'
import { recordEntries } from '@primitives/objects.utils'
import type { FormUpdates } from '@ui-kit/utils/react-form.utils'
import type { FieldValues, FormErrors, PartialFields, UseFormReturn } from './form.types'

/**
 * Hook used to manage form state and validation. For now, simply delegates the call to react-hook-form.
 * This custom hook allows us to change the backend without changing the calling code.
 */
export const useForm = <T extends FieldValues = FieldValues>({
  defaultValues,
  resolver,
}: {
  defaultValues: T
  resolver?: (values: T, context: unknown, options: ResolverOptions<T>) => Promise<ResolverResult<T>>
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
    resolver,
    mode: 'onChange',
    reValidateMode: 'onBlur',
    resetOptions: { keepErrors: false },
    delayError: 150,
    criteriaMode: 'all',
  })
  return {
    handleSubmit: handleSubmit as UseFormReturn<T>['handleSubmit'],
    trigger,
    reset,
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
    formState: {
      isSubmitting,
      errors: errors as FormErrors<T>,
      touchedFields: touchedFields as PartialFields<T>,
      isDirty,
      isValid,
      dirtyFields: dirtyFields as PartialFields<T>,
    },
  }
}
