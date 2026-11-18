import { isEqual } from 'lodash'
import { useCallback, useState } from 'react'
import { changedKeys, fromEntries } from '@primitives/objects.utils'
import { useDebounced } from '@ui/hooks/useDebounce'

/** Immediate and automatic updates sync only supplied fields; automatic updates do not touch fields. */
type UpdateMode = 'debounced' | 'immediate' | 'automatic'

type FormState<T> = {
  /** what’s currently in the inputs**/
  values: T
  /** what queries should use**/
  params: T
  /** baseline for isDirty, restored by reset() and replaced by reset(updates) */
  defaults: T
  touched: Set<keyof T>
  /** resets validation even when values are unchanged**/
  resetVersion: number
}

const initialState = <T>(defaultValues: T, resetVersion = 0) => ({
  values: defaultValues,
  params: defaultValues,
  defaults: defaultValues,
  touched: new Set<keyof T>(),
  resetVersion,
})

function updateForm<T>(prev: FormState<T>, updates: Partial<T>, mode: UpdateMode) {
  const values = { ...prev.values, ...updates }
  const params = mode === 'debounced' ? prev.params : { ...prev.params, ...updates }

  if (isEqual(values, prev.values) && isEqual(params, prev.params)) return prev

  const touched =
    mode === 'automatic' ? prev.touched : new Set([...prev.touched, ...changedKeys(updates, prev.values, isEqual)])
  return { ...prev, values, params, touched }
}

/**
 * Editable values with debounced query params.
 */
export function useFormValues<T extends object, C extends object = object>({
  defaultValues,
  context,
}: {
  defaultValues: T
  context: C
}) {
  const [state, setState] = useState<FormState<T>>(() => initialState(defaultValues))

  const { params, resetVersion, values, touched, defaults } = state

  const debounce = useDebounced(
    useCallback(
      // Each call restarts the timer; when it fires, copy the latest values into params.
      () => setState(prev => (isEqual(prev.params, prev.values) ? prev : { ...prev, params: prev.values })),
      [],
    ),
  )

  return {
    values,
    params: { ...params, ...context },
    resetVersion,
    touchedFields: fromEntries<keyof T, true>([...touched].map(field => [field, true])),
    isDirty: [...touched].some(field => !isEqual(values[field], defaults[field])),
    isDebouncing: !isEqual(values, params),
    isTouched: (...fields: (keyof T)[]) => fields.some(field => touched.has(field)),
    update: useCallback(
      (updates: Partial<T>, { mode = 'debounced' }: { mode?: UpdateMode } = {}) => {
        setState(prev => updateForm(prev, updates, mode))
        if (mode === 'debounced') debounce()
      },
      [debounce],
    ),
    reset: useCallback(
      (updates?: Partial<T>) =>
        setState(prev => initialState(updates ? { ...prev.values, ...updates } : prev.defaults, prev.resetVersion + 1)),
      [],
    ),
  }
}

export type FormValues<T extends object, C extends object = object> = ReturnType<typeof useFormValues<T, C>>
