import { useEffect, useMemo } from 'react'
import type { FieldValues, SetValueConfig, UseFormReturn } from 'react-hook-form'
import type { FormState } from 'react-hook-form'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'

/** Options to pass to react-hook-form's setValue to trigger validation, dirty and touch states. */
export const setValueOptions: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }

export const filterFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  notFalsy(
    ...(recordEntries(formState.errors) as [keyof TFieldValues | 'root', Error | undefined][])
      .filter(([field, error]) => field in formState.dirtyFields && error?.message)
      .map(([field, error]) => [field, error!.message!] as const),
  )

export const useFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  useMemo(() => filterFormErrors(formState), [formState])

export const useCallbackAfterFormUpdate = <TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  callback: () => void,
) => useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])
