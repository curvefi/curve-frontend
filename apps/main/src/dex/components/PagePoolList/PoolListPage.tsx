import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import Settings from '@/dex/layout/default/Settings'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { PoolListTable } from '../../features/pool-list/PoolListTable'

export const PoolListPage = () => {
  const network = useNetworkFromUrl()
  const { curveApi = null } = useConnection()
  return (
    <ListPageWrapper>
      {network && <PoolListTable network={network} curve={curveApi} />}
      <Settings showScrollButton />
    </ListPageWrapper>
  )
}
