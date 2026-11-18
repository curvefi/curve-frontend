import { useMemo } from 'react'
import type { Suite } from 'vest'
import { isEmpty, mapRecord, recordEntries, recordValues } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import type { Query } from '@ui/features/queries/util'
import type { FieldName } from '@ui/lib/validation/types'
import type { UseFormHandleSubmit } from './form.types'
import type { FormValues } from './useFormValues'

const getVisibleErrors = (errors: Record<string, Error>, touchedFields: object, isDirty: boolean) =>
  recordEntries(errors)
    .filter(([field]) => field in touchedFields || (field.startsWith('root') && isDirty))
    .map<[string, string]>(([field, error]) => [field, error.message])

const getValidationFields = (data: object, computed: Record<string, unknown>, isDebouncing: boolean) =>
  Object.keys(data).filter(field => !(field in computed) || (!isDebouncing && computed[field] !== undefined))

/** Validate ready fields, retain pending errors, and submit current values with their computed limits. */
export function useFormValidation<T extends object, C extends object, K extends FieldName<T>>(
  form: FormValues<T, C>,
  {
    validation,
    computed,
    isSubmitting,
  }: { validation: Suite<FieldName<T>, string>; computed: Record<K, Query<T[K]>>; isSubmitting: boolean },
) {
  const { values, touchedFields, isDirty, isDebouncing, resetVersion } = form
  const session = useMemo(() => {
    validation.reset()
    return { validation, resetVersion }
  }, [validation, resetVersion])

  const { error, isLoading } = combineQueryState(...recordValues(computed))
  const computedValues = mapRecord(computed, (_, q) => q.data)
  const data = { ...values, ...computedValues }

  const result = session.validation.run(data, getValidationFields(data, computedValues, isDebouncing))
  const errors = mapRecord(result.getErrors(), (_, messages) => new Error(messages[0]))
  const isValid = recordValues(computedValues).every(v => v !== undefined) && isEmpty(errors)

  const isDisabled = isDebouncing || !isValid || isSubmitting

  return {
    ...form,
    params: { ...form.params, ...computedValues },
    handleSubmit: (onSubmit => async event => {
      event?.preventDefault()
      if (!isDisabled) await onSubmit(data)
    }) satisfies UseFormHandleSubmit<T>,
    formState: {
      errors,
      touchedFields,
      isDirty,
      isValid,
      isSubmitting,
      visibleErrors: getVisibleErrors(errors, touchedFields, isDirty),
    },
    error,
    isLoading: isDebouncing || isLoading || isSubmitting,
    isDisabled,
  }
}

export type ValidatedForm<T extends object, C extends object = object, K extends FieldName<T> = never> = ReturnType<
  typeof useFormValidation<T, C, K>
>
