import { useEffect } from 'react'
import { useShallowData } from '@ui/hooks/useShallowData'
import type { FieldValues, FormUpdates, UseFormReturn } from './form.types'
import type { FormValues } from './useFormValues'

/**
 * Syncs supplied fields when they change or the form resets, while enabled. Omitted fields are left unchanged.
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
  const { update } = form
  const isFormValues = 'resetVersion' in form // whether we use the newer useFormValues hook.
  const resetVersion = isFormValues && form.resetVersion
  const stableValues = useShallowData(values)
  useEffect(() => {
    if (enabled) update(stableValues, isFormValues ? { mode: 'automatic' } : { automated: true })
  }, [enabled, update, isFormValues, stableValues, resetVersion])
}
