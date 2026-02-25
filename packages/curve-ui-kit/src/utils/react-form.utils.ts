import { useEffect, useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, FormState, Path, UseFormReturn } from 'react-hook-form'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'

export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

/**
 * react-hook-form update helper that uses a fixed update policy and then runs a full `form.trigger()` once per call.
 * This is necessary because form.setValue() doesn't revalidate all fields.
 * Any validation in the form root or in other fields can leave the form in an invalid state.
 * We prefer to have this helper to force full revalidation to avoid silly mistakes that are hard to debug.
 * Direct `form.setValue()` / `form.trigger()` calls are lint-restricted.
 */
export function updateForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  updates: FormUpdates<TFieldValues>,
): void {
  const changes = recordEntries(updates).filter(([field, value]) => form.getValues(field) !== value)
  if (!changes.length) return // no changes, skip revalidation
  changes.forEach(([field, value]) =>
    // eslint-disable-next-line no-restricted-syntax
    form.setValue(field as Path<TFieldValues>, value, {
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
      .filter(
        ([field, error]) =>
          (field in formState.touchedFields || (field === 'root' && formState.isDirty)) && error?.message,
      )
      .map(([field, error]) => [field, error!.message!] as const),
  )

export const useFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  useMemo(() => filterFormErrors(formState), [formState])

export const useCallbackAfterFormUpdate = <TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  callback: () => void,
) => useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

/** Checks if any of the given fields are touched in the form. */
export const isFormTouched = <T extends FieldValues>(form: UseFormReturn<T>, ...fields: Path<T>[]) =>
  fields.some((field) => field in form.formState.touchedFields)
