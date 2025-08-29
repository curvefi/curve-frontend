import { useCallback, useMemo } from 'react'
import {
  useLocation as useTanstackLocation,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
} from '@tanstack/react-router'

export function useNavigate() {
  const navigate = useTanstackNavigate()
  return useCallback(
    (to: string, options: { replace?: boolean; state?: any } = {}): void => void navigate({ to, ...options }),
    [navigate],
  )
}

export function useSearchParams(): URLSearchParams {
  const { search } = useTanstackLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export const useParams = <T>(): T => {
  const params = useTanstackParams({ strict: false })
  return params as unknown as T
}

export const usePathname = () => useTanstackLocation().pathname
