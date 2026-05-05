import { useMemo } from 'react'
// eslint-disable-next-line no-restricted-imports
import { DefaultValues, useForm as _useForm, type ResolverResult, type ResolverOptions } from 'react-hook-form'
import type { FieldValues, FormErrors, PartialFields, UseFormReturn } from './types'

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
  } = _useForm(
    useMemo(
      () => ({
        defaultValues: defaultValues as DefaultValues<T>,
        resolver,
        mode: 'onChange',
        reValidateMode: 'onBlur',
        resetOptions: { keepErrors: false },
        delayError: 150,
        criteriaMode: 'all',
      }),
      [defaultValues, resolver],
    ),
  )
  return {
    handleSubmit: handleSubmit as UseFormReturn<T>['handleSubmit'],
    trigger,
    reset,
    watch,
    getValues,
    setValue,
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
