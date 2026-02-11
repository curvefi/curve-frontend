import { useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, SetValueConfig, UseFormReturn } from 'react-hook-form'
import type { FormState } from 'react-hook-form'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'

/** Options to pass to react-hook-form's setValue to trigger validation, dirty and touch states. */
const DEFAULT_SET_FORM_VALUE_OPTIONS: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }

/**
 * Set a field value and force a full form revalidation.
 * Use this when resolver rules depend on multiple fields and `formState.isValid` must be refreshed immediately.
 */
export const setFormValue = <TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>(
  form: UseFormReturn<TFieldValues>,
  field: TFieldName,
  value: FieldPathValue<TFieldValues, TFieldName>,
  options: SetValueConfig = DEFAULT_SET_FORM_VALUE_OPTIONS,
): void => {
  // eslint-disable-next-line no-restricted-syntax
  form.setValue(field, value, options)
  // eslint-disable-next-line no-restricted-syntax
  form.trigger().catch((error: unknown) => console.error('setFormValue(): form.trigger() failed', error))
}

export const filterFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  notFalsy(
    ...(recordEntries(formState.errors) as [keyof TFieldValues | 'root', Error | undefined][])
      .filter(([field, error]) => field in formState.dirtyFields && error?.message)
      .map(([field, error]) => [field, error!.message!] as const),
  )

export const useFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  useMemo(() => filterFormErrors(formState), [formState])
