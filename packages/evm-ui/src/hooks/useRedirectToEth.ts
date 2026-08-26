import { useEffect } from 'react'
import { usePathname, useNavigate } from '@evm-ui/hooks/router'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'
import { addCypressRouteDiagnostic, IS_CYPRESS } from '@evm-ui/utils'

export function useRedirectToEth(network: { showInSelectNetwork?: boolean } | undefined, networkId: string) {
  const push = useNavigate()
  const pathname = usePathname()
  useEffect(() => {
    if (!network?.showInSelectNetwork && pathname) {
      const redirectUrl = replaceNetworkInPath(pathname, 'ethereum')
      if (IS_CYPRESS) {
        const message = [
          'useRedirectToEth redirect',
          `from=${pathname}`,
          `networkId=${networkId}`,
          `networkExists=${Boolean(network)}`,
          `showInSelectNetwork=${String(network?.showInSelectNetwork)}`,
          `to=${redirectUrl}`,
        ].join(' ')
        addCypressRouteDiagnostic(message)
        console.warn(`Network not supported ${networkId}, redirecting...`, message)
      } else {
        console.warn(`Network not supported ${networkId}, redirecting...`)
      }
      push(redirectUrl)
    }
  }, [networkId, network, push, pathname])
}
