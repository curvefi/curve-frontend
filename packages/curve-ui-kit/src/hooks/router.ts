import { 
  useNavigate as useTanstackNavigate, 
  useLocation as useTanstackLocation, 
  useParams as useTanstackParams,
  useSearch as useTanstackSearch,
  useLoaderData as useTanstackLoaderData,
  useRouteContext as useTanstackRouteContext
} from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

/**
 * Custom useNavigate hook that wraps TanStack Router's navigation API
 * to match React Router's API for easier migration
 */
export function useNavigate() {
  const navigate = useTanstackNavigate()
  
  return useCallback((to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      // Handle relative navigation like navigate(-1)
      window.history.go(to)
      return
    }
    
    // Handle string navigation
    navigate({ 
      to,
      replace: options?.replace,
      state: options?.state 
    })
  }, [navigate])
}

/**
 * Custom useSearchParams hook that matches React Router's API
 */
export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void] {
  const navigate = useTanstackNavigate()
  const search = useTanstackSearch({ strict: false })
  const location = useTanstackLocation()
  
  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location.search])
  
  const setSearchParams = useCallback((params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => {
    const newParams = typeof params === 'function' ? params(searchParams) : params
    navigate({ 
      to: location.pathname,
      search: Object.fromEntries(newParams.entries()),
      replace: true 
    })
  }, [navigate, location.pathname, searchParams])
  
  return [searchParams, setSearchParams]
}

/**
 * Re-export useLocation from TanStack Router
 * The API is already compatible
 */
export { useTanstackLocation as useLocation }

/**
 * Re-export useParams from TanStack Router
 * The API is already compatible
 */
export { useTanstackParams as useParams }

/**
 * Re-export useLoaderData from TanStack Router
 */
export { useTanstackLoaderData as useLoaderData }

/**
 * Re-export useRouteContext from TanStack Router
 */
export { useTanstackRouteContext as useRouteContext }

/**
 * Type exports for loader functions
 */
export type { LoaderFunctionArgs as ClientLoaderFunctionArgs } from '@tanstack/react-router'