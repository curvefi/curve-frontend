import { useCallback } from 'react'
import { useRouter, useSearchParams as useOriginalSearchParams } from '@ui-kit/hooks/router'

export { useParams, usePathname } from '@ui-kit/hooks/router'

export const useNavigate = () => {
  const { push, replace } = useRouter()
  return useCallback(
    (url: string, { replace: shouldReplace }: { replace?: boolean } = {}): void =>
      void (shouldReplace ? replace : push)(url),
    [push, replace],
  )
}

export const useSearchParams = useOriginalSearchParams as () => URLSearchParams
