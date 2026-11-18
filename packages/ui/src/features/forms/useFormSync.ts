import { identity } from 'lodash'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { FormUpdates, UseFormReturn, FieldValues } from './form.types'
import type { FormValues } from './useFormValues'

/**
 * Syncs the form when the supplied fields change. Omitted fields are left unchanged.
 */
export function useFormSync<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, 'update'>,
  values: FormUpdates<T>,
  enabled?: boolean,
): void
export function useFormSync<T extends object>(
  form: Pick<FormValues<T>, 'update' | 'resetVersion'>,
  values: Partial<T>,
  enabled?: boolean,
): void
export function useFormSync(
  form: Pick<UseFormReturn, 'update'> | Pick<FormValues<FieldValues>, 'update' | 'resetVersion'>,
  values: FieldValues,
  enabled = true,
) {
  const update = 'resetVersion' in form ? form.update : undefined
  const legacyUpdate = 'resetVersion' in form ? undefined : form.update
  const stableValues = useShallow(identity<FieldValues>)(values)
  useEffect(() => {
    if (!enabled) return
    if (update) update(stableValues, { mode: 'automatic' })
    else legacyUpdate?.(stableValues, { automated: true })
  }, [enabled, update, legacyUpdate, stableValues])
}
