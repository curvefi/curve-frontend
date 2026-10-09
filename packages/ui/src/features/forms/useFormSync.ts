import { identity } from 'lodash'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { FormUpdates, UseFormReturn, FieldValues } from './form.types'

/**
 * Syncs the form when the supplied fields change. Omitted fields are left unchanged.
 */
export const useFormSync = <T extends FieldValues>(
  { update: updateForm }: Pick<UseFormReturn<T>, 'update'>,
  values: FormUpdates<T>,
  enabled = true,
) => {
  const stableValues = useShallow(identity<FormUpdates<T>>)(values)
  useEffect(() => {
    if (enabled) updateForm(stableValues, { automated: true })
  }, [enabled, updateForm, stableValues])
}
