import { useCallback, useMemo } from 'react'
import {
  useLocation as useTanstackLocation,
  useMatchRoute as useTanstackMatchRoute,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
} from '@tanstack/react-router'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NavigateOptions = { replace?: boolean; resetScroll?: boolean; state?: any }

/**
 * Use navigate function from tanstack router.
 * Returns a function that accepts a URL string and an options object with `replace`, `resetScroll` and `state` properties.
 * Scroll is reset on push navigation and preserved on replace navigation, unless `resetScroll` is explicitly set.
 */
export function useNavigate() {
  const navigate = useTanstackNavigate()
  return useCallback(
    (to: string, options?: NavigateOptions): void => void navigate({ to, resetScroll: !options?.replace, ...options }),
    [navigate],
  )
}

/**
 * Use URL search params from tanstack router.
 * Note that during navigation, this will reflect the *new* search params before the navigation is complete.
 */
export function useSearchParams(): URLSearchParams {
  const { search } = useTanstackLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

type SearchParamsUpdate = Record<string, string | string[] | null>

export const getSearchString = (update: SearchParamsUpdate, previous?: URLSearchParams) => {
  const params = new URLSearchParams(previous ?? '')
  Object.entries(update).forEach(([key, value]) => {
    params.delete(key)
    if (Array.isArray(value)) value.forEach(item => params.append(key, item))
    else if (value != null) params.set(key, value)
  })
  return params.size ? `?${params}`.replaceAll('%2C', ',') : ''
}

/**
 * Update URL search params through TanStack Router, preserving the current pathname.
 */
export function useSearchNavigate(searchParams: URLSearchParams) {
  const navigate = useNavigate()
  const pathname = usePathname()
  return useCallback(
    (update: SearchParamsUpdate, options?: NavigateOptions) => {
      navigate(pathname + getSearchString(update, searchParams), options)
    },
    [navigate, pathname, searchParams],
  )
}

/**
 * Use URL params from tanstack router.
 * Note that during navigation, this will reflect the *old* params until the navigation is complete.
 */
export const useParams = <T>(): T => {
  const params = useTanstackParams({ strict: false })
  return params as unknown as T
}

/**
 * Get current pathname from tanstack router.
 * Note that during navigation, this will reflect the *new* pathname before the navigation is complete.
 */
export const usePathname = () => useTanstackLocation().pathname

export const useLocation = useTanstackLocation

/**
 * Use matchRoute from tanstack router and return typed params or false if the route does not match.
 */
export function useMatchRoute<T extends Record<string, string> = Record<string, string>>(
  options: Parameters<ReturnType<typeof useTanstackMatchRoute>>[0],
): T | false {
  const matchRoute = useTanstackMatchRoute()
  return matchRoute(options) as T | false
}
