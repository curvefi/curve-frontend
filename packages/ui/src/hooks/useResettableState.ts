import { type DependencyList, useState } from 'react'

/**
 * Editable state that resets to the current initial value when a reset dependency changes.
 * Dependencies are compared with Object.is; recreating an initializer alone does not reset the state.
 * Initializers run during rendering and must be pure. They can read values that should not trigger a reset.
 */
export function useResettableState<T>(initialState: T | (() => T), resetDependencies: DependencyList) {
  const [value, setValue] = useState<T>(initialState)
  const [previousDependencies, setPreviousDependencies] = useState(resetDependencies)

  if (
    previousDependencies.length !== resetDependencies.length ||
    resetDependencies.some((dependency, index) => !Object.is(previousDependencies[index], dependency))
  ) {
    setPreviousDependencies(resetDependencies)
    setValue(initialState)
  }

  return [value, setValue] as const
}
