import { useEffect } from 'react'
import type { FormUpdates, UseFormReturn, FieldValues } from './form.types'

/**
 * Syncs the form with the given values. IMPORTANT: This only works if you always pass the same keys in the same order!
 */
export const useFormSync = <T extends FieldValues>(
  { update: updateForm }: Pick<UseFormReturn<T>, 'update'>,
  values: FormUpdates<T>,
) => {
  useEffect(
    () => updateForm(values, { automated: true }),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [updateForm, ...Object.values(values)],
  )
}
