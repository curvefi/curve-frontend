import { useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, FormState, UseFormReturn } from 'react-hook-form'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'

export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

/**
 * Required RHF update helper in this codebase.
 * Always uses a fixed update policy (`shouldValidate: false`, `shouldDirty: true`, `shouldTouch: true`)
 * and then runs a full `form.trigger()` once per call.
 * Direct `form.setValue()` / `form.trigger()` calls are lint-restricted.
 */
export function updateForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  updates: FormUpdates<TFieldValues>,
): void {
  recordEntries(updates).forEach(([field, value]) =>
    // eslint-disable-next-line no-restricted-syntax
    form.setValue(field, value, {
      shouldValidate: false, // we revalidate just below.
      shouldDirty: true,
      shouldTouch: true,
    }),
  )
  // eslint-disable-next-line no-restricted-syntax
  form.trigger().catch((error: unknown) => console.error('updateForm(): form.trigger() failed', error))
}

export const filterFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  notFalsy(
    ...(recordEntries(formState.errors) as [keyof TFieldValues | 'root', Error | undefined][])
      .filter(([field, error]) => field in formState.dirtyFields && error?.message)
      .map(([field, error]) => [field, error!.message!] as const),
  )

export const useFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  useMemo(() => filterFormErrors(formState), [formState])
