import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { replaceNetworkInPath } from '@ui-kit/shared/routes'

export function useRedirectToEth(
  network: { showInSelectNetwork?: boolean } | undefined,
  networkId: string,
  hydrated: boolean,
) {
  const { push } = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    if (!network?.showInSelectNetwork && pathname && hydrated) {
      console.warn(`Network not supported ${networkId}, redirecting...`)
      push(replaceNetworkInPath(pathname, 'ethereum'))
    }
  }, [networkId, network?.showInSelectNetwork, push, pathname, hydrated])
}
