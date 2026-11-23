import type { BaseSyntheticEvent } from 'react'
import type { Suite } from 'vest'
import { mapRecord, recordEntries } from '@primitives/objects.utils'
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

/** Validate every input; defer computed checks while values debounce or results are missing. */
const getValidationFields = <T extends object>(data: T, computed: Record<string, unknown>, isDebouncing: boolean) =>
  (Object.keys(data) as FieldName<T>[]).filter(
    field => !(field in computed) || (!isDebouncing && computed[field] !== undefined),
  )

/** Validate inputs and computed limits; touched state only controls error visibility. */
export function useFormValidation<TValues extends object, TContext extends object, TComputed extends object>({
  inputs,
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
  const { values, touchedFields, isDirty, isDebouncing, resetVersion, params: inputParams } = inputs

  const { error, isLoading } = combineQueryState(...Object.values<Query<unknown>>(computed))
  const computedValues = mapRecord(computed, (_, q) => q.data) as AllowUndefined<TComputed>
  const data = useShallowData({ ...values, ...computedValues })

  const { errors, isValid } = useVestValidation<TValues & TComputed>(
    validation,
    resetVersion,
    data,
    getValidationFields(data, computedValues, isDebouncing),
  )
  const isDisabled = disabled || isDebouncing || !isValid || isSubmitting

  return {
    ...inputs,
    params: useShallowData({ ...inputParams, ...computedValues }),
    handleSubmit: (onSubmit => async (event?: BaseSyntheticEvent) => {
      event?.preventDefault()
      if (!isDisabled) await onSubmit(data) // Modals call this directly, button state doesn't cover every submission
    }) satisfies UseFormHandleSubmit<TValues & Partial<TComputed>>,
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
