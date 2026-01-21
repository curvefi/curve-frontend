import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { PoolListTable } from '../../features/pool-list/PoolListTable'

export const PoolListPage = () => {
  const network = useNetworkFromUrl()
  return <ListPageWrapper>{network && <PoolListTable network={network} />}</ListPageWrapper>
}
