import { type SubmitEventHandler, useEffect, useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, FormState, Path, UseFormReturn } from 'react-hook-form'
import { notFalsy, recordEntries } from '@primitives/objects.utils'
import type { Query } from '@ui-kit/types/util'

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
  { automated = false }: { automated?: boolean } = {},
): void {
  const changes = recordEntries(updates).filter(([field, value]) => form.getValues(field) !== value)
  if (!changes.length) return // no changes, skip revalidation
  changes.forEach(([field, value]) =>
    // eslint-disable-next-line no-restricted-syntax
    form.setValue(field as Path<TFieldValues>, value, {
      shouldValidate: false, // we revalidate just below.
      shouldDirty: !automated,
      shouldTouch: !automated,
    }),
  )
  // eslint-disable-next-line no-restricted-syntax
  form.trigger().catch((error: unknown) => console.error('updateForm(): form.trigger() failed', error))
}

/**
 * Syncs the form with the given values. IMPORTANT: This only works if you always pass the same keys in the same order!
 */
export const useFormSync = <TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  values: FormUpdates<TFieldValues>,
) =>
  // eslint-disable-next-line @eslint-react/exhaustive-deps
  useEffect(() => updateForm(form, values, { automated: true }), [...Object.values(values), form])

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

/**
 * Syncs `data` to `callback` whenever it changes to a valid value. Clears it when unmounting.
 */
export function useCallbackSync<T>({ data }: Query<T | null>, callback: (data: T | undefined) => void): void {
  useEffect(() => (data == null ? undefined : callback(data)), [callback, data]) // keep parent in sync, keep stale while revalidating
  useEffect(() => () => callback(undefined), [callback]) // clear stale data only when unmounting
}

/** Checks if any of the given fields are touched in the form. */
export const isFormTouched = <T extends FieldValues>(form: UseFormReturn<T>, ...fields: Path<T>[]) =>
  fields.some(field => field in form.formState.touchedFields)

export const cancelSubmit: SubmitEventHandler<HTMLFormElement> = e => e.preventDefault()
