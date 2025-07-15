import { useCallback, useMemo } from 'react'
import {
  useLoaderData as useTanstackLoaderData,
  useLocation as useTanstackLocation,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
  useRouteContext as useTanstackRouteContext
} from '@tanstack/react-router'

/**
 * Custom useNavigate hook that wraps TanStack Router's navigation API
 * to match NextJS API for easier migration
 */
export function useNavigate() {
  const navigate = useTanstackNavigate()

  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: any }) => {
      if (typeof to === 'number') {
        // Handle relative navigation like navigate(-1)
        window.history.go(to)
        return
      }

      // Handle string navigation
      void navigate({
        to,
        replace: options?.replace,
        state: options?.state,
      })
    },
    [navigate],
  )
}

/**
 * Custom useSearchParams hook that matches React Router's API
 */
export function useSearchParams(): URLSearchParams {
  const { search } = useTanstackLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

/**
 * Re-export useParams from TanStack Router
 * The API is already compatible
 */
export const useParams = <T>() => useTanstackParams({ strict: false }) as T

/**
 * Re-export useLoaderData from TanStack Router
 */
export { useTanstackLoaderData as useLoaderData }

/**
 * Re-export useRouteContext from TanStack Router
 */
export { useTanstackRouteContext as useRouteContext }

export const usePathname = () => useTanstackLocation().pathname