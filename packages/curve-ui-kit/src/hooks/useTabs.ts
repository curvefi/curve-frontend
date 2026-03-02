import { useState } from 'react'
import type { TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'

/** Finds a tab by key, throwing if not found. */
export function findTab<T extends { value: string }>(tabs: T[], key: string | undefined): T {
  const found = tabs.find(({ value }) => value === key)
  if (!found) throw new Error(`No tab found for key "${key}" in [${tabs.map((t) => t.value).join(', ')}]`)
  return found
}

/**
 * Generic tab state management hook.
 * If the stored key is no longer present in options (e.g. a tab becomes
 * hidden), the hook falls back to options[0].value automatically.
 */
export function useTabs<T>(
  options: readonly TabOption<T>[],
  defaultValue?: T,
): {
  tab: T | undefined
  onTabChange: (value: T) => void
  tabOptions: readonly TabOption<T>[]
} {
  const [requestedValue, onTabChange] = useState<T | undefined>(defaultValue)
  const isPresent = requestedValue !== undefined && options.some((o) => o.value === requestedValue)
  const tab = isPresent ? requestedValue : options[0]?.value
  return { tab, onTabChange, tabOptions: options }
}
