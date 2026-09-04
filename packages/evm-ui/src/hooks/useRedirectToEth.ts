import { useEffect } from 'react'
import { usePathname, useNavigate } from '@evm-ui/hooks/router'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'

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
