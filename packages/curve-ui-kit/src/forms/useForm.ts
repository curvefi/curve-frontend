import { useMemo } from 'react'
import { DefaultValues, useForm as _useForm } from 'react-hook-form'
import type { ICreateResult as ValidationSuite } from '@hookform/resolvers/vest'
import { vestResolver } from '@hookform/resolvers/vest'
import type { FieldValues, FormErrors, PartialFields, UseFormReturn } from './types'

export const useForm = <T extends FieldValues = FieldValues>({
  defaultValues,
  validation,
}: {
  defaultValues: T
  validation?: ValidationSuite
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
        ...(validation && { resolver: vestResolver(validation) }),
        mode: 'onChange',
        reValidateMode: 'onBlur',
        resetOptions: { keepErrors: false },
        delayError: 150,
        criteriaMode: 'all',
      }),
      [defaultValues, validation],
    ),
  )
  return {
    values: watch() as T,
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
