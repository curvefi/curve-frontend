import { isEqual } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { changedKeys, fromEntries } from '@primitives/objects.utils'
import { useDebounced } from '@ui/hooks/useDebounce'
import { useShallowData } from '@ui/hooks/useShallowData'

/** Immediate and automatic updates sync only supplied fields; automatic updates do not touch fields. */
type UpdateMode = 'debounced' | 'immediate' | 'automatic'

type FormState<TValues> = {
  /** Current input values, updated immediately. */
  values: TValues
  /** Debounced query values; immediate/automatic updates sync supplied fields only. */
  params: TValues
  /** Baseline for isDirty, restored by reset() and replaced by reset(updates). */
  defaults: TValues
  /** Fields changed by non-automatic updates; syncing params does not touch fields. */
  touched: Set<keyof TValues>
  /** Resets validation even when values are unchanged. */
  resetVersion: number
}

const initialState = <TValues>(defaultValues: TValues, resetVersion = 0) => ({
  values: defaultValues,
  params: defaultValues,
  defaults: defaultValues,
  touched: new Set<keyof TValues>(),
  resetVersion,
})

function updateForm<TValues>(prev: FormState<TValues>, updates: Partial<TValues>, mode: UpdateMode) {
  const values = { ...prev.values, ...updates }
  const params = mode === 'debounced' ? prev.params : { ...prev.params, ...updates }

  if (isEqual(values, prev.values) && isEqual(params, prev.params)) return prev

  const justTouched =
    mode === 'automatic' ? [] : changedKeys(updates, prev.values, isEqual).filter(field => !prev.touched.has(field))
  const touched = justTouched.length ? new Set([...prev.touched, ...justTouched]) : prev.touched
  return { ...prev, values, params, touched }
}

/**
 * Editable values with debounced query params.
 */
export function useFormValues<TValues extends object, TContext extends object = object>({
  defaultValues,
  context,
}: {
  defaultValues: TValues
  context: TContext
}) {
  const [state, setState] = useState<FormState<TValues>>(() => initialState(defaultValues))

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
    params: useShallowData<TValues & TContext>({ ...params, ...context }),
    resetVersion,
    touchedFields: useMemo(() => fromEntries<keyof TValues, true>([...touched].map(field => [field, true])), [touched]),
    isDirty: [...touched].some(field => !isEqual(values[field], defaults[field])),
    isDebouncing: !isEqual(values, params),
    isTouched: useCallback((...fields: (keyof TValues)[]) => fields.some(field => touched.has(field)), [touched]),
    update: useCallback(
      (updates: Partial<TValues>, { mode = 'debounced' }: { mode?: UpdateMode } = {}) => {
        setState(prev => updateForm(prev, updates, mode))
        if (mode === 'debounced') debounce()
      },
      [debounce],
    ),
    reset: useCallback(
      (updates?: Partial<TValues>) =>
        setState(prev => initialState(updates ? { ...prev.values, ...updates } : prev.defaults, prev.resetVersion + 1)),
      [],
    ),
  }
}

export type FormValues<TValues extends object, TContext extends object = object> = ReturnType<
  typeof useFormValues<TValues, TContext>
>
