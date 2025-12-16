import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { PoolListTable } from '../../features/pool-list/PoolListTable'

export const PoolListPage = () => {
  const network = useNetworkFromUrl()
  const { curveApi = null } = useCurve()
  return <ListPageWrapper>{network && <PoolListTable network={network} curve={curveApi} />}</ListPageWrapper>
}
