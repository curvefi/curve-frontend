import type { UrlObject } from 'url'
import { useSearchParams as useOriginalSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

export { useParams, usePathname } from 'next/navigation'

export const useNavigate = () => {
  const { push, replace } = useRouter()
  return useCallback(
    (url: UrlObject | string, { replace: shouldReplace }: { replace?: boolean } = {}): void =>
      void (shouldReplace ? replace : push)(url),
    [push, replace],
  )
}

export const useSearchParams = useOriginalSearchParams as () => URLSearchParams
