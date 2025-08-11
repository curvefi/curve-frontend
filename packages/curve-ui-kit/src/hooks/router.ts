import { useRouter, useSearchParams as useOriginalSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export { useParams, usePathname } from 'next/navigation'

export const useNavigate = () => {
  const { push, replace } = useRouter()
  return useCallback(
    (url: string, { replace: shouldReplace }: { replace?: boolean } = {}): void =>
      void (shouldReplace ? replace : push)(url),
    [push, replace],
  )
}

export const useSearchParams = useOriginalSearchParams as () => URLSearchParams
