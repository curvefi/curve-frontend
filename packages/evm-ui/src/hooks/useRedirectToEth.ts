import { useEffect } from 'react'
import { usePathname, useNavigate } from '@evm-ui/hooks/router'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'

export function useRedirectToEth(network: { showInSelectNetwork?: boolean } | undefined, networkId: string) {
  const push = useNavigate()
  const pathname = usePathname()
  useEffect(() => {
    if (!network?.showInSelectNetwork && pathname) {
      console.warn(`Network not supported ${networkId}, redirecting...`)
      push(replaceNetworkInPath(pathname, 'ethereum'))
    }
  }, [networkId, network?.showInSelectNetwork, push, pathname])
}
