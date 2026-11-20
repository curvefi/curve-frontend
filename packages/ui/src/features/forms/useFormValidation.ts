import { useCallback } from 'react'
import type { Suite } from 'vest'
import { mapRecord, objectKeys, recordEntries } from '@primitives/objects.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import type { AllowUndefined, Query } from '@ui/features/queries/util'
import { useShallowData } from '@ui/hooks/useShallowData'
import type { FieldName } from '@ui/lib/validation/types'
import type { FieldValues, UseFormHandleSubmit, UseFormReturn } from './form.types'
import type { FormValues } from './useFormValues'
import { useVestValidation } from './useVestValidation'

const getVisibleErrors = (errors: Record<string, Error>, touchedFields: object, isDirty: boolean) =>
  recordEntries(errors)
    .filter(([field]) => field in touchedFields || (field.startsWith('root') && isDirty))
    .map<[string, string]>(([field, error]) => [field, error.message])

/** Validate inputs and computed limits; touched state only controls error visibility. */
export function useFormValidation<TValues extends object, TContext extends object, TComputed extends object>({
  inputs: {
    values,
    touchedFields,
    dirtyFields,
    isDirty,
    isDebouncing,
    resetVersion,
    params: inputParams,
    reset,
    isTouched,
    update,
  },
  validation,
  computed,
  isSubmitting,
  disabled = false,
}: {
  inputs: FormValues<TValues, TContext>
  validation: Suite<FieldName<TValues & TComputed>, string>
  computed: { [K in keyof TComputed]: Query<TComputed[K]> }
  isSubmitting: boolean
  disabled?: boolean
}) {
  const { error, isLoading } = combineQueryState(...Object.values<Query<unknown>>(computed))
  const computedValues = mapRecord(computed, (_, q) => q.data) as AllowUndefined<TComputed>
  const data = useShallowData({ ...values, ...computedValues })

  const fieldsToValidate = [
    ...objectKeys(data),
    ...objectKeys(computedValues).filter(field => !isDebouncing && computedValues[field] !== undefined),
  ]
  const { errors, isValid } = useVestValidation<TValues & TComputed>(validation, resetVersion, data, fieldsToValidate)
  const isDisabled = disabled || isDebouncing || !isValid || isSubmitting

  return {
    values,
    params: useShallowData({ ...inputParams, ...computedValues }),
    handleSubmit: useCallback<UseFormHandleSubmit<TValues & Partial<TComputed>>>(
      onSubmit => async event => {
        event?.preventDefault()
        if (!isDisabled) await onSubmit(data) // Modals call this directly, button state doesn't cover every submission
      },
      [data, isDisabled],
    ),
    formState: {
      errors,
      touchedFields,
      dirtyFields,
      isDirty,
      isValid,
      isSubmitting,
      visibleErrors: getVisibleErrors(errors, touchedFields, isDirty),
    },
    error,
    isLoading: isDebouncing || isLoading || isSubmitting,
    isDisabled,
    isDebouncing,
    isTouched,
    resetVersion,
    reset,
    update,
  }
}

export type ValidatedForm<
  TValues extends object,
  TContext extends object = object,
  TComputed extends object = object,
> = ReturnType<typeof useFormValidation<TValues, TContext, TComputed>>

/**
 * Form fields consumed by controls; update only needs the values argument.
 * @deprecated This is only needed in components used by both useForm and this newer useFormValidation hook.
 **/
export type FormControl<TValues extends object = FieldValues> = Pick<ValidatedForm<TValues>, 'values'> &
  Pick<ValidatedForm<FieldValues> | UseFormReturn, 'formState'> & { update: (values: Partial<TValues>) => void }
