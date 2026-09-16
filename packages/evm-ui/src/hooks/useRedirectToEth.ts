import { useEffect } from 'react'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'
import { usePathname, useNavigate } from '@ui/hooks/router'

export function useRedirectToEth(blockchainId: string, supportedBlockchainIds: string[]) {
  const push = useNavigate()
  const pathname = usePathname()
  useEffect(() => {
    if (!supportedBlockchainIds.includes(blockchainId) && pathname) {
      console.warn(`Chain '${blockchainId}' not supported, redirecting...`)
      push(replaceNetworkInPath(pathname, 'ethereum'))
    }
  }, [blockchainId, supportedBlockchainIds, push, pathname])
}
