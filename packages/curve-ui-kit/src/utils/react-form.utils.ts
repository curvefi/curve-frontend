import { useEffect, useMemo } from 'react'
import { notFalsy, recordEntries } from '@primitives/objects.utils'
import type { FieldPath, FieldPathValue, FieldValues, FormState, UseFormReturn } from '@ui-kit/features/forms'
import type { Query } from '@ui-kit/types/util'

export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

type FormUpdater<TFieldValues extends FieldValues> = Pick<UseFormReturn<TFieldValues>, 'updateForm'>

/**
 * Syncs the form with the given values. IMPORTANT: This only works if you always pass the same keys in the same order!
 */
export const useFormSync = <TFieldValues extends FieldValues>(
  { updateForm }: FormUpdater<TFieldValues>,
  values: FormUpdates<TFieldValues>,
) => {
  useEffect(
    () => updateForm(values, { automated: true }),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [updateForm, ...Object.values(values)],
  )
}

export const filterFormErrors = <TFieldValues extends FieldValues>(formState: FormState<TFieldValues>) =>
  notFalsy(
    ...recordEntries(formState.errors)
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
export const isFormTouched = <T extends FieldValues>(form: UseFormReturn<T>, ...fields: FieldPath<T>[]) =>
  fields.some(field => field in form.formState.touchedFields)
