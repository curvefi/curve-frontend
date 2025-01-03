import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

type Tab = { value: string; label: string }
type TabId<T extends readonly Tab[]> = T[number]['value']

/**
 * Hook to sync tab state with URL query parameter
 * @param tabs Array of available tabs
 * @param defaultTab Default tab value if none in URL
 * @returns Current tab and setter function
 * @example
 * ```tsx
 * const TABS = [
 *   { value: 'dex', label: 'Dex' },
 *   { value: 'lend', label: 'Lending' }
 * ] as const
 *
 * const { tab, setTab } = useTabFromQueryString(TABS, 'dex')
 *
 * // With TabsSwitcher
 * return (
 *   <TabsSwitcher
 *     variant="contained"
 *     value={tab}
 *     onChange={setTab}
 *     options={[...TABS]}
 *   />
 * )
 * ```
 */
export const useTabFromQueryString = <T extends readonly Tab[]>(tabs: T, defaultTab: TabId<T>) => {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const params = new URLSearchParams(search)

  const tab: TabId<T> = tabs.find((t) => t.value === params.get('tab'))?.value ?? defaultTab

  const setTab = useCallback(
    (newTab: TabId<T>) => {
      const params = new URLSearchParams(search)
      params.set('tab', newTab)
      navigate(`${pathname}?${params.toString()}`)
    },
    [navigate, pathname, search],
  )

  return { tab, setTab }
}
