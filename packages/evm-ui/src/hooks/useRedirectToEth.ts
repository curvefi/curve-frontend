import { useEffect } from 'react'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'
import { useLocation, useNavigate } from '@ui/hooks/router'

export function useRedirectToEth(blockchainId: string, supportedBlockchainIds: string[]) {
  const push = useNavigate()
  const { pathname, searchStr } = useLocation()
  useEffect(() => {
    if (!supportedBlockchainIds.includes(blockchainId) && pathname) {
      console.warn(`Chain '${blockchainId}' not supported, redirecting...`)
      push(replaceNetworkInPath(pathname, 'ethereum') + searchStr)
    }
  }, [blockchainId, supportedBlockchainIds, push, pathname, searchStr])
}
