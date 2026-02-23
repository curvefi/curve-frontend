import { useCallback, useMemo } from 'react'
import {
  useLocation as useTanstackLocation,
  useMatchRoute as useTanstackMatchRoute,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
} from '@tanstack/react-router'

/**
 * Use navigate function from tanstack router.
 * Returns a function that accepts a URL string and an options object with `replace` and `state` properties.
 */
export function useNavigate() {
  const navigate = useTanstackNavigate()
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (to: string, options: { replace?: boolean; state?: any } = {}): void => void navigate({ to, ...options }),
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
