import { useEffect } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, UseFormReturn } from '@ui-kit/features/forms'
import type { Query } from '@ui-kit/types/util'

export type FormUpdates<TFieldValues extends FieldValues> = Partial<{
  [K in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, K>
}>

/**
 * Syncs the form with the given values. IMPORTANT: This only works if you always pass the same keys in the same order!
 */
export const useFormSync = <TFieldValues extends FieldValues>(
  { updateForm }: Pick<UseFormReturn<TFieldValues>, 'updateForm'>,
  values: FormUpdates<TFieldValues>,
) => {
  useEffect(
    () => updateForm(values, { automated: true }),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [updateForm, ...Object.values(values)],
  )
}

/**
 * Syncs `data` to `callback` whenever it changes to a valid value. Clears it when unmounting.
 */
export function useCallbackSync<T>({ data }: Query<T | null>, callback: (data: T | undefined) => void): void {
  useEffect(() => (data == null ? undefined : callback(data)), [callback, data]) // keep parent in sync, keep stale while revalidating
  useEffect(() => () => callback(undefined), [callback]) // clear stale data only when unmounting
}
