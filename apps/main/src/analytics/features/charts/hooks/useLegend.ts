import { useState, useMemo } from 'react'

export type LegendItem<T extends string> = {
  id: T
  label: string
  color: string
  togglable?: boolean
}

/**
 * A React hook to manage legend items and their toggle states.
 *
 * This hook provides legend items and their toggle states for use in components
 * that require a legend with togglable items. It also computes which items are currently disabled
 * based on their toggle state.
 *
 * @template T - A string literal type that represents the unique IDs of the legend items.
 * @param items - An array of LegendItem<T> to be managed by the hook.
 * @returns An object containing:
 *          - items: The array of legend items.
 *          - toggles: An object with keys as item IDs and values as booleans representing
 *                     the toggle state.
 *          - setToggle: Function to update a specific toggle state.
 *          - disabled: An array of item IDs that are currently disabled (toggled off).
 *
 * @example
 * ```typescript
 * const { items, toggles, setToggle, disabled } = useLegend(() => [
 *   { id: 'sales', label: 'Sales', color: 'blue', togglable: true },
 *   { id: 'revenue', label: 'Revenue', color: 'green', togglable: true }
 * ]);
 *
 * // Access legend items
 * console.log(items);
 *
 * // Toggle an item
 * setToggle('sales', false);
 *
 * // Check disabled items
 * console.log(disabled); // ['sales']
 * ```
 */
export function useLegend<const T extends string>(
  items: LegendItem<T>[],
): {
  items: LegendItem<T>[]
  toggles: Record<T, boolean>
  setToggle: (id: T, value: boolean) => void
  disabled: T[]
} {
  const [toggles, setToggles] = useState(
    () => Object.fromEntries(items.map((item) => [item.id, true])) as Record<T, boolean>,
  )

  const setToggle = (id: T, value: boolean) => {
    setToggles((prev) => ({ ...prev, [id]: value }))
  }

  const disabled = useMemo(() => items.filter((item) => !toggles[item.id]).map((item) => item.id), [items, toggles])

  return { items, toggles, setToggle, disabled }
}
