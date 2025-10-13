import { useChainId } from '@/dex/hooks/useChainId'
import Settings from '@/dex/layout/default/Settings'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { PoolListTable } from '../../features/pool-list/PoolListTable'

export const PoolListPage = () => {
  const params = useParams<NetworkUrlParams>()
  const { curveApi = null } = useConnection()
  const rChainId = useChainId(params.network)
  return (
    <ListPageWrapper>
      {rChainId && <PoolListTable rChainId={rChainId} curve={curveApi} />}
      <Settings showScrollButton />
    </ListPageWrapper>
  )
}
